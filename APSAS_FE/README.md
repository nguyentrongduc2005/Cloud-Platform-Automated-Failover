# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Test accounts

Tạm thời dự án dùng mock data cho đăng nhập. Bạn có thể thử nhanh các vai trò:

| Role        | Email                   | Password | Ghi chú                       |
|-------------|------------------------|----------|-------------------------------|
| Student     | `student01@apsas.dev`  | `123456` | Truy cập trang học viên       |
| Giảng viên  | `gv.tranminh@apsas.dev`| `123456` | Kiểm thử màn hình giáo viên   |

Email chứa chuỗi `gv` sẽ tự động gán role giảng viên, `admin` sẽ gán role quản trị. Nút “Mock Login (Test)” trong màn Login cũng sử dụng cơ chế này để bạn thử nghiệm nhanh.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
