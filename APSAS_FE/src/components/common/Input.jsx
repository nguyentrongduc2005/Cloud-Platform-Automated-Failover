export default function Input({ label, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
          text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
          disabled:opacity-50 transition-colors
          ${className}
        `}
      />
    </div>
  );
}
