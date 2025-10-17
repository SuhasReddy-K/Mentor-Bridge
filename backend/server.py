from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# --- Models ---
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    role: str  # student, mentor, admin
    college: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = []
    expertise: Optional[List[str]] = []
    years_experience: Optional[int] = None
    photo: Optional[str] = None
    rating: Optional[float] = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str
    college: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    college: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = []
    expertise: Optional[List[str]] = []
    years_experience: Optional[int] = None
    photo: Optional[str] = None
    rating: Optional[float] = 0.0

class Session(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    mentor_id: str
    date: str
    time: str
    status: str  # pending, confirmed, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    mentor_id: str
    date: str
    time: str
    notes: Optional[str] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    to_user_id: str
    content: str

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    from_user_id: str
    to_user_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackCreate(BaseModel):
    session_id: str
    to_user_id: str
    rating: int
    comment: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    years_experience: Optional[int] = None
    photo: Optional[str] = None


# --- Helper functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")


# --- Seed Data ---
async def seed_sample_data():
    # Check if data already exists
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        return
    
    # Sample students
    students = [
        {"name": "Saikanth", "email": "saikanth@gmail.com", "college": "IIT Hyderabad"},
        {"name": "Harsha", "email": "harsha@gmail.com", "college": "NIT Warangal"},
        {"name": "Praveen", "email": "praveen@gmail.com", "college": "SRM University"},
        {"name": "Likith", "email": "likith@gmail.com", "college": "VIT Chennai"},
        {"name": "Bhavana", "email": "bhavana@gmail.com", "college": "PES University"},
        {"name": "Kiran", "email": "kiran@gmail.com", "college": "JNTU Hyderabad"},
        {"name": "Divya", "email": "divya@gmail.com", "college": "Osmania University"},
        {"name": "Rakesh", "email": "rakesh@gmail.com", "college": "Amrita University"},
        {"name": "Sneha", "email": "sneha@gmail.com", "college": "Christ University"},
        {"name": "Arjun", "email": "arjun@gmail.com", "college": "Anna University"},
        {"name": "Rithika", "email": "rithika@gmail.com", "college": "IIT Hyderabad"},
        {"name": "Goutham", "email": "goutham@gmail.com", "college": "NIT Warangal"},
        {"name": "Nikhil", "email": "nikhil@gmail.com", "college": "SRM University"},
        {"name": "Lavanya", "email": "lavanya@gmail.com", "college": "VIT Chennai"},
        {"name": "Suresh", "email": "suresh@gmail.com", "college": "PES University"},
        {"name": "Manasa", "email": "manasa@gmail.com", "college": "JNTU Hyderabad"},
        {"name": "Chaitanya", "email": "chaitanya@gmail.com", "college": "Osmania University"},
        {"name": "Teja", "email": "teja@gmail.com", "college": "Amrita University"},
        {"name": "Pooja", "email": "pooja@gmail.com", "college": "Christ University"},
        {"name": "Rajesh", "email": "rajesh@gmail.com", "college": "Anna University"},
    ]
    
    for student in students:
        user = User(
            email=student["email"],
            name=student["name"],
            password_hash=get_password_hash(student["name"].lower()),
            role="student",
            college=student["college"],
            skills=["Python", "JavaScript"],
            bio="Eager to learn and grow in my career."
        )
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
    
    # Sample mentors
    mentors = [
        {
            "name": "Dr. Ravi Kumar",
            "email": "ravikumar@gmail.com",
            "college": "IIT Madras",
            "years_experience": 10,
            "expertise": ["AI", "ML"],
            "bio": "Passionate about AI/ML research and helping students navigate their career paths. Over 10 years of industry experience.",
            "rating": 4.8
        },
        {
            "name": "Anjali Mehta",
            "email": "anjalimehta@gmail.com",
            "college": "Delhi University",
            "years_experience": 8,
            "expertise": ["Marketing", "Strategy"],
            "bio": "Marketing strategist with a focus on digital transformation. Love mentoring students in business strategy.",
            "rating": 4.6
        },
        {
            "name": "Vijay Rao",
            "email": "vijayrao@gmail.com",
            "college": "NIT Trichy",
            "years_experience": 7,
            "expertise": ["Data Science", "Cloud"],
            "bio": "Data scientist specializing in cloud-based solutions. Helping students build strong technical foundations.",
            "rating": 4.7
        },
        {
            "name": "Sneha Patel",
            "email": "snehapatel@gmail.com",
            "college": "BITS Pilani",
            "years_experience": 6,
            "expertise": ["Software Engineering"],
            "bio": "Senior software engineer with expertise in full-stack development. Dedicated to student success.",
            "rating": 4.9
        },
        {
            "name": "Rohan Sharma",
            "email": "rohansharma@gmail.com",
            "college": "SRM University",
            "years_experience": 5,
            "expertise": ["Cybersecurity"],
            "bio": "Cybersecurity expert helping students understand the importance of security in modern applications.",
            "rating": 4.5
        },
        {
            "name": "Kavya Iyer",
            "email": "kavyaiyer@gmail.com",
            "college": "VIT Vellore",
            "years_experience": 9,
            "expertise": ["Full Stack Dev"],
            "bio": "Full-stack developer with a passion for teaching modern web technologies to aspiring developers.",
            "rating": 4.8
        },
        {
            "name": "Arjun Menon",
            "email": "arjunmenon@gmail.com",
            "college": "PES University",
            "years_experience": 4,
            "expertise": ["Web Technologies"],
            "bio": "Web developer specializing in React and Node.js. Helping students build real-world projects.",
            "rating": 4.4
        },
        {
            "name": "Nisha Verma",
            "email": "nishaverma@gmail.com",
            "college": "Osmania University",
            "years_experience": 6,
            "expertise": ["Databases"],
            "bio": "Database architect with experience in SQL and NoSQL systems. Mentoring students in data modeling.",
            "rating": 4.6
        },
        {
            "name": "Rakesh Gupta",
            "email": "rakeshgupta@gmail.com",
            "college": "JNTU Hyderabad",
            "years_experience": 7,
            "expertise": ["Embedded Systems"],
            "bio": "Embedded systems engineer passionate about IoT and hardware-software integration.",
            "rating": 4.5
        },
        {
            "name": "Priya Sharma",
            "email": "priyasharma@gmail.com",
            "college": "Amity University",
            "years_experience": 8,
            "expertise": ["Project Management"],
            "bio": "Certified PMP with expertise in agile methodologies. Helping students develop leadership skills.",
            "rating": 4.7
        },
    ]
    
    for mentor in mentors:
        user = User(
            email=mentor["email"],
            name=mentor["name"],
            password_hash=get_password_hash(mentor["name"].split()[0].lower()),
            role="mentor",
            college=mentor["college"],
            years_experience=mentor["years_experience"],
            expertise=mentor["expertise"],
            bio=mentor["bio"],
            rating=mentor["rating"],
            photo=f"https://ui-avatars.com/api/?name={mentor['name'].replace(' ', '+')}&size=200&background=2C3EAA&color=fff"
        )
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
    
    # Create admin user
    admin = User(
        email="admin@mentorbridge.com",
        name="Admin",
        password_hash=get_password_hash("admin123"),
        role="admin",
        bio="Platform administrator"
    )
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    logger.info("Sample data seeded successfully")


# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "Mentor Bridge API"}

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        college=user_data.college
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_access_token({"sub": user.id})
    
    return {
        "token": token,
        "user": UserResponse(**user.model_dump())
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    
    return {
        "token": token,
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# User routes
@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.put("/users/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    return UserResponse(**updated_user)

# Mentor routes
@api_router.get("/mentors", response_model=List[UserResponse])
async def get_mentors(search: Optional[str] = None, expertise: Optional[str] = None):
    query = {"role": "mentor"}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"expertise": {"$regex": search, "$options": "i"}}
        ]
    
    if expertise:
        query["expertise"] = {"$regex": expertise, "$options": "i"}
    
    mentors = await db.users.find(query, {"_id": 0}).to_list(1000)
    return [UserResponse(**mentor) for mentor in mentors]

# Session routes
@api_router.post("/sessions")
async def create_session(session_data: SessionCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can book sessions")
    
    session = Session(
        student_id=current_user["id"],
        mentor_id=session_data.mentor_id,
        date=session_data.date,
        time=session_data.time,
        status="pending",
        notes=session_data.notes
    )
    
    doc = session.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sessions.insert_one(doc)
    
    return session

@api_router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "student":
        sessions = await db.sessions.find({"student_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    elif current_user["role"] == "mentor":
        sessions = await db.sessions.find({"mentor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    else:
        sessions = await db.sessions.find({}, {"_id": 0}).to_list(1000)
    
    # Enrich with user data
    for session in sessions:
        student = await db.users.find_one({"id": session["student_id"]}, {"_id": 0, "name": 1, "email": 1})
        mentor = await db.users.find_one({"id": session["mentor_id"]}, {"_id": 0, "name": 1, "email": 1})
        session["student_name"] = student["name"] if student else "Unknown"
        session["mentor_name"] = mentor["name"] if mentor else "Unknown"
    
    return sessions

@api_router.put("/sessions/{session_id}/status")
async def update_session_status(session_id: str, status: str, current_user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if current_user["role"] == "mentor" and session["mentor_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "Session status updated"}

# Message routes
@api_router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    message = Message(
        from_user_id=current_user["id"],
        to_user_id=message_data.to_user_id,
        content=message_data.content
    )
    
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.messages.insert_one(doc)
    
    return message

@api_router.get("/messages")
async def get_messages(current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [{"from_user_id": current_user["id"]}, {"to_user_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Enrich with user data
    for message in messages:
        from_user = await db.users.find_one({"id": message["from_user_id"]}, {"_id": 0, "name": 1})
        to_user = await db.users.find_one({"id": message["to_user_id"]}, {"_id": 0, "name": 1})
        message["from_user_name"] = from_user["name"] if from_user else "Unknown"
        message["to_user_name"] = to_user["name"] if to_user else "Unknown"
    
    return messages

# Feedback routes
@api_router.post("/feedback")
async def submit_feedback(feedback_data: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    feedback = Feedback(
        session_id=feedback_data.session_id,
        from_user_id=current_user["id"],
        to_user_id=feedback_data.to_user_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment
    )
    
    doc = feedback.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.feedback.insert_one(doc)
    
    # Update mentor rating
    all_feedback = await db.feedback.find({"to_user_id": feedback_data.to_user_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(f["rating"] for f in all_feedback) / len(all_feedback)
    await db.users.update_one(
        {"id": feedback_data.to_user_id},
        {"$set": {"rating": round(avg_rating, 1)}}
    )
    
    return feedback

@api_router.get("/feedback/{user_id}")
async def get_user_feedback(user_id: str):
    feedback = await db.feedback.find({"to_user_id": user_id}, {"_id": 0}).to_list(1000)
    
    for fb in feedback:
        from_user = await db.users.find_one({"id": fb["from_user_id"]}, {"_id": 0, "name": 1})
        fb["from_user_name"] = from_user["name"] if from_user else "Unknown"
    
    return feedback

# Analytics routes
@api_router.get("/analytics/stats")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "student":
        total_sessions = await db.sessions.count_documents({"student_id": current_user["id"]})
        completed_sessions = await db.sessions.count_documents({"student_id": current_user["id"], "status": "completed"})
        pending_sessions = await db.sessions.count_documents({"student_id": current_user["id"], "status": "pending"})
        
        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "pending_sessions": pending_sessions,
            "progress": round((completed_sessions / total_sessions * 100) if total_sessions > 0 else 0, 1)
        }
    
    elif current_user["role"] == "mentor":
        total_sessions = await db.sessions.count_documents({"mentor_id": current_user["id"]})
        completed_sessions = await db.sessions.count_documents({"mentor_id": current_user["id"], "status": "completed"})
        pending_sessions = await db.sessions.count_documents({"mentor_id": current_user["id"], "status": "pending"})
        feedback_count = await db.feedback.count_documents({"to_user_id": current_user["id"]})
        
        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "pending_sessions": pending_sessions,
            "feedback_count": feedback_count,
            "rating": current_user.get("rating", 0.0)
        }
    
    else:  # admin
        total_users = await db.users.count_documents({})
        total_students = await db.users.count_documents({"role": "student"})
        total_mentors = await db.users.count_documents({"role": "mentor"})
        total_sessions = await db.sessions.count_documents({})
        completed_sessions = await db.sessions.count_documents({"status": "completed"})
        
        return {
            "total_users": total_users,
            "total_students": total_students,
            "total_mentors": total_mentors,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions
        }

@api_router.get("/analytics/chart-data")
async def get_chart_data(current_user: dict = Depends(get_current_user)):
    # Simple chart data for progress tracking
    if current_user["role"] == "student":
        sessions = await db.sessions.find({"student_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    elif current_user["role"] == "mentor":
        sessions = await db.sessions.find({"mentor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    else:
        sessions = await db.sessions.find({}, {"_id": 0}).to_list(1000)
    
    status_counts = {"pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0}
    for session in sessions:
        status = session.get("status", "pending")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "labels": list(status_counts.keys()),
        "data": list(status_counts.values())
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_sample_data()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
