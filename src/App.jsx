import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import LecturerDashboard from './pages/LecturerDashboard'
import CreateCourse from './pages/CreateCourse'
import MyCourses from './pages/MyCourses'
import JoinCourse from './pages/JoinCourse'
import StartAttendance from './pages/StartAttendance'
import MarkAttendance from './pages/MarkAttendance'
import AttendanceRecords from './pages/AttendanceRecords'
import AttendanceHistory from './pages/AttendanceHistory'
import CreateAssignment from './pages/CreateAssignment'
import Assignments from './pages/Assignments'
import ManageSessions from './pages/ManageSessions'
import AttendancePercentage from './pages/AttendancePercentage'
import CourseStudents from './pages/CourseStudents'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Notes from './pages/Notes'
import PendingApproval from './pages/PendingApproval'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/join-course" element={<JoinCourse />} />
        <Route path="/start-attendance" element={<StartAttendance />} />
        <Route path="/mark-attendance" element={<MarkAttendance />} />
        <Route path="/attendance-records/:sessionId" 
          element={<AttendanceRecords />} />
        <Route path="/attendance-history" 
          element={<AttendanceHistory />} />
        <Route path="/create-assignment" 
          element={<CreateAssignment />} />
          <Route path="/attendance-percentage" 
  element={<AttendancePercentage />} />
<Route path="/course-students/:courseId" 
  element={<CourseStudents />} />
  <Route path="/pending-approval" element={<PendingApproval />} />
<Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/manage-sessions" element={<ManageSessions />} />
      </Routes>

      
    </BrowserRouter>
  )
}

export default App
