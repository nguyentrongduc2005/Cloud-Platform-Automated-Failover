export const continueCourse = {
  id: "web-fundamentals",
  title: "Lập trình web cơ bản đến nâng cao cho người mới bắt đầu",
  desc: "Xây dựng website responsive từ HTML, CSS, JS. Từng bước tạo dự án thực chiến theo chuẩn.",
  image:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  stats: { learners: 87, progress: "8/15" },
};

export const featured = [
  {
    id: "restful-api",
    title: "RESTful API",
    desc: "Thiết kế/triển khai REST API với Spring Boot, bảo mật và test.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
    stats: { learners: 110, progress: "3/9" },
    badge: "•",
  },
  {
    id: "database-mysql",
    title: "Database MySQL",
    desc: "Modeling, indexing, ACID, stored procedures.",
    image:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop",
    stats: { learners: 99, progress: "9/11" },
  },
  {
    id: "java-basics",
    title: "Java cơ bản",
    desc: "Cú pháp, OOP, collections, exception, file I/O.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
    stats: { learners: 27, progress: "15/27" },
  },
  {
    id: "array-algorithms",
    title: "ARRAY",
    desc: "Thuật toán mảng từ cơ bản đến nâng cao.",
    image:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
    stats: { learners: 90, progress: "8/18" },
  },
];

export const interview = [
  {
    id: "python-basics",
    title: "Python cơ bản cho người mới bắt đầu",
    desc: "Cú pháp, kiểu dữ liệu, module – sẵn sàng phỏng vấn.",
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop",
    stats: { learners: 120, progress: "26/40" },
  },
  {
    id: "data-structures-algorithms",
    title: "Cấu trúc dữ liệu & giải thuật",
    desc: "Các cấu trúc và thuật toán cốt lõi.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop",
    stats: { learners: 111, progress: "32/45" },
  },
  {
    id: "oop-programming",
    title: "Lập trình hướng đối tượng",
    desc: "SOLID, patterns, clean architecture.",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop",
    stats: { learners: 110, progress: "12/34" },
  },
  {
    id: "javascript-basics",
    title: "Javascript cơ bản",
    desc: "ES6, DOM, fetch API, bundler.",
    image:
      "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=450&fit=crop",
    stats: { learners: 86, progress: "14/25" },
  },
];

export const learn = [
  {
    id: "cpp-course",
    title: "Khóa học C++",
    desc: "OOP C++ và nền tảng vững.",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop",
    stats: { learners: 802, progress: "25/30" },
  },
  {
    id: "kotlin-advanced",
    title: "Kotlin cơ bản đến nâng cao",
    desc: "Coroutine, flow, DI, arch components.",
    image:
      "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=450&fit=crop",
    stats: { learners: 58, progress: "10/21" },
  },
  {
    id: "flutter-dev",
    title: "Flutter",
    desc: "App đa nền tảng, state management.",
    image:
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=450&fit=crop",
    stats: { learners: 72, progress: "14/23" },
  },
  {
    id: "java-advanced",
    title: "Java nâng cao",
    desc: "Streams, concurrency, Spring.",
    image:
      "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800&h=450&fit=crop",
    stats: { learners: 100, progress: "7/18" },
  },
];
const allCourses = [...featured, ...interview, ...learn, continueCourse];

export function getCourseById(id) {
  if (!id) return null;
  return allCourses.find((c) => String(c.id) === String(id)) || null;
}
