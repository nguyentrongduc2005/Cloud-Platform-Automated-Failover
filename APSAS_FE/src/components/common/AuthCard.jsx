export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-md mx-auto my-8">
      <div className="bg-card border border-border p-8 rounded-xl shadow-lg backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
