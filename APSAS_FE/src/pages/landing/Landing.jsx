import { Link, Navigate } from "react-router-dom";
import { Users, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function NeonBlob({ className }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-40 ${className}`}
      style={{
        background:
          "radial-gradient(closest-side, rgba(34,197,94,0.5), rgba(34,197,94,0.15), transparent)",
      }}
    />
  );
}
function CourseCard({ title, mentor, students }) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 p-4 ring-1 ring-emerald-400/20 transition hover:ring-emerald-400/40">
      <div className="overflow-hidden rounded-xl">
        <img
          src="/images/course-java.png"
          alt="Java course"
          className="w-full h-40 md:h-48 object-cover"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-emerald-400">Free Course</span>
        <span className="text-neutral-400">{students}</span>
      </div>
      <div className="mt-1 text-white font-medium">{title}</div>
      <div className="mt-1 text-sm text-neutral-400">{mentor}</div>
    </div>
  );
}
export default function LandingPage() {
  console.log("🏠 Landing Page RENDER");

  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, redirect về trang Public Courses
  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Neon Effects */}
      <NeonBlob className="left-[-10%] top-[10%] h-72 w-72" />
      <NeonBlob className="right-[-10%] top-[-5%] h-80 w-80" />
      <NeonBlob className="right-[10%] bottom-[-10%] h-96 w-96" />

      <main className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          {/* Hero */}
          <section className="grid grid-cols-1 items-center gap-10 py-10 md:grid-cols-2 md:py-16">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                <span className="text-neutral-200">More than a </span>
                <span className="text-white">grader</span>
                <br />
                <span className="text-neutral-200">Your AI coding </span>
                <span className="text-emerald-400">mentor</span>
              </h1>
              <p className="mt-4 text-neutral-400 text-base md:text-lg">
                Learn by doing with in-depth AI feedback. Get instant analysis
                on your code's correctness, quality, and vulnerabilities.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="rounded-lg border border-emerald-400/40 bg-transparent px-5 py-2.5 text-sm text-white shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] hover:bg-emerald-500/10 transition"
                >
                  Contact Us
                </a>
                <Link
                  to="/auth/register"
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-emerald-400 transition"
                >
                  Create account
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop"
                alt="Workspace Setup"
                className="w-full rounded-3xl object-cover ring-1 ring-emerald-400/20 shadow-[0_0_60px_rgba(16,185,129,0.25)]"
              />
            </div>
          </section>

          {/* Learning Path */}
          <section className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                alt="Person learning on laptop"
                className="w-full max-w-lg object-cover rounded-2xl ring-1 ring-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Your Personalized{" "}
                <span className="text-emerald-400">Learning Path</span>
              </h2>
              <p className="text-base text-neutral-400 mb-8">
                We build personalized learning paths, offering free courses and
                quality materials, to help you start your learning journey in a
                structured and effective way.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    num: 1,
                    color: "bg-purple-500/20 border-purple-500/30",
                    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
                  },
                  {
                    num: 2,
                    color: "bg-emerald-500/20 border-emerald-500/30",
                    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
                  },
                  {
                    num: 3,
                    color: "bg-cyan-500/20 border-cyan-500/30",
                    img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className={`rounded-xl border ${item.color} overflow-hidden shadow-[0_0_40px_-12px_rgba(34,197,94,0.25)] hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="p-3">
                      <div className="text-emerald-400 text-lg font-bold">
                        {item.num}.
                      </div>
                    </div>
                    <div className="h-28 bg-neutral-800/60 overflow-hidden">
                      <img
                        src={item.img}
                        alt={`Step ${item.num}`}
                        className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* POPULAR COURSES */}
          <section id="courses" className="mt-20 md:mt-32 pb-24">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-3">
              Popular <span className="text-emerald-400">Courses</span>
            </h2>
            <p className="text-center text-white/70 max-w-2xl mx-auto mb-12">
              Top-quality courses, highly-rated by our learners.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  title: "Java for beginner",
                  students: 40,
                  lessons: 12,
                  img: "1517694712202-14dd9538aa97",
                },
                {
                  id: 2,
                  title: "Modern JavaScript",
                  students: 35,
                  lessons: 15,
                  img: "1515879218367-8466d910aaa4",
                },
                {
                  id: 3,
                  title: "Python Basics",
                  students: 50,
                  lessons: 10,
                  img: "1555066931-4365d14bab8c",
                },
              ].map((course) => (
                <article
                  key={course.id}
                  className="group rounded-2xl bg-zinc-900/60 ring-1 ring-emerald-400/20 hover:ring-emerald-400/40 transition-all overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.3)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${course.img}?w=800&h=450&fit=crop`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-semibold">
                        Free Course
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {course.students}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {course.lessons}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm text-neutral-400">
                        Mentor name
                      </span>
                      <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition">
                        Learn more →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
