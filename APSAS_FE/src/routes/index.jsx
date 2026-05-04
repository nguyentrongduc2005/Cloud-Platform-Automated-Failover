import { Routes, Route } from "react-router-dom";

import AuthGuard from "../components/common/AuthGuard";
import MainAppLayout from "../components/common/MainAppLayout";
import AuthLayout from "../components/common/AuthLayout";

import Landing from "../pages/landing/Landing.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import VerifyOtp from "../pages/auth/VerifyOtp.jsx";
import OAuthCallback from "../pages/auth/OAuthCallback.jsx";
import Logout from "../pages/auth/Logout.jsx";
import PublicCourses from "../pages/PublicCourses.jsx";
import CourseDetail from "../pages/CourseDetail.jsx";
import StudentMyCourses from "../pages/student/MyCourses.jsx";
import StudentProgress from "../pages/student/Progress.jsx";
import StudentCourseDetail from "../pages/student/CourseDetail.jsx";
import StudentContentDetail from "../pages/student/ContentDetail.jsx";
import StudentAssignmentDetail from "../pages/student/AssignmentDetail.jsx";
import LecturerMyCourses from "../pages/lecturer/MyCourses.jsx";
import LecturerAssignments from "../pages/lecturer/Assignments.jsx";
import LecturerAssignmentDetail from "../pages/lecturer/AssignmentDetail.jsx";
import CourseAssignments from "../pages/lecturer/CourseAssignments.jsx";
import CourseOverview from "../pages/lecturer/CourseOverview.jsx";
import UploadCourseAvatar from "../pages/lecturer/UploadCourseAvatar.jsx";
import Profile from "../pages/Profile.jsx";
import Support from "../pages/Support.jsx";

import ContentApprovals from "../pages/admin/ContentApprovals.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import RolePermissions from "../pages/admin/RolePermissions.jsx";
import AdminTutorialDetail from "../pages/admin/AdminTutorialDetail.jsx";
import ErrorPage from "@/pages/error/ErrorPage";

import ProviderResources from "../pages/provider/ProviderResources";
import ResourceDetail from "../pages/provider/ResourceDetail";
import ResourceDetailReadOnly from "../pages/provider/ResourceDetailReadOnly";
import CreateContent from "../pages/provider/CreateContent";
import CreateAssignment from "../pages/provider/CreateAssignment";
import ContentDetailView from "../pages/provider/ContentDetailView";
import AssignmentDetailView from "../pages/provider/AssignmentDetailView";
import ResourceManagement from "../pages/provider/ResourceManagement";
import TeacherTutorialLibrary from "../pages/lecturer/ResourceLibrary";
import ResourceModeration from "../pages/admin/ResourceModeration";
import ApplyResourceToCourse from "../pages/lecturer/ApplyResourceToCourse";
import CreateCourse from "../pages/lecturer/CreateCourse";

const Dashboard = () => <div>Dashboardssss</div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />
        <Route path="auth/verify" element={<VerifyOtp />} />
        <Route path="auth/callback" element={<OAuthCallback />} />
      </Route>

      <Route path="logout" element={<Logout />} />

      <Route element={<MainAppLayout />}>
        <Route index element={<Landing />} />
        <Route path="courses" element={<PublicCourses />} />
        <Route path="course/:courseId" element={<CourseDetail />} />

        <Route element={<AuthGuard />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<Support />} />
        </Route>

        <Route element={<AuthGuard allow={["student"]} />}>
          <Route path="student/my-courses" element={<StudentMyCourses />} />
          <Route path="student/progress" element={<StudentProgress />} />
          <Route
            path="student/my-courses/:courseId"
            element={<StudentCourseDetail />}
          />
          <Route
            path="student/courses/:courseId/content/:contentId"
            element={<StudentContentDetail />}
          />
          <Route
            path="student/courses/:courseId/assignments/:assignmentId"
            element={<StudentAssignmentDetail />}
          />
        </Route>

        <Route element={<AuthGuard allow={["lecturer"]} />}>
          <Route path="lecturer/my-courses" element={<LecturerMyCourses />} />
          <Route path="lecturer/assignments" element={<LecturerAssignments />} />
          <Route
            path="lecturer/courses/:courseId/assignments/:assignmentId"
            element={<LecturerAssignmentDetail />}
          />
          <Route path="lecturer/courses/:courseId" element={<CourseOverview />} />
          <Route
            path="lecturer/courses/:courseId/assignments"
            element={<CourseAssignments />}
          />
          <Route path="resources" element={<TeacherTutorialLibrary />} />
          <Route
            path="resources/:resourceId/view"
            element={<ResourceDetailReadOnly />}
          />
          <Route
            path="resources/:resourceId/view/content/:contentId"
            element={<ContentDetailView />}
          />
          <Route
            path="resources/:resourceId/view/assignment/:assignmentId"
            element={<AssignmentDetailView />}
          />
          <Route path="resources/:id/apply" element={<ApplyResourceToCourse />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route
            path="courses/:courseId/upload-avatar"
            element={<UploadCourseAvatar />}
          />
        </Route>

        <Route element={<AuthGuard allow={["provider"]} />}>
          <Route path="provider/resources" element={<ProviderResources />} />
          <Route
            path="provider/resources/:resourceId"
            element={<ResourceDetail />}
          />
          <Route
            path="provider/resources/:resourceId/view"
            element={<ResourceDetailReadOnly />}
          />
          <Route
            path="provider/resources/:resourceId/create-content"
            element={<CreateContent />}
          />
          <Route
            path="provider/resources/:resourceId/create-assignment"
            element={<CreateAssignment />}
          />
          <Route
            path="provider/resources/:resourceId/content/:contentId"
            element={<ContentDetailView />}
          />
          <Route
            path="provider/resources/:resourceId/content/:contentId/edit"
            element={<CreateContent />}
          />
          <Route
            path="provider/resources/:resourceId/assignment/:assignmentId"
            element={<AssignmentDetailView />}
          />
          <Route
            path="provider/resources/:resourceId/view/content/:contentId"
            element={<ContentDetailView />}
          />
          <Route
            path="provider/resources/:resourceId/view/assignment/:assignmentId"
            element={<AssignmentDetailView />}
          />
          <Route
            path="provider/resources/:resourceId/assignment/:assignmentId/edit"
            element={<CreateAssignment />}
          />
          <Route
            path="provider/resources/:resourceId/edit"
            element={<ResourceDetail />}
          />
          <Route
            path="provider/resource-management"
            element={<ResourceManagement />}
          />
        </Route>

        <Route element={<AuthGuard allow={["admin"]} />}>
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/content" element={<ContentApprovals />} />
          <Route path="admin/permissions" element={<RolePermissions />} />
          <Route path="admin/resources" element={<ResourceModeration />} />
          <Route
            path="admin/resources/:tutorialId"
            element={<AdminTutorialDetail />}
          />
        </Route>
      </Route>

      <Route path="/403" element={<div>Khong co quyen truy cap</div>} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
