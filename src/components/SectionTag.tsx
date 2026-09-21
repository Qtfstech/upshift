interface SectionTagProps {
  label: string;
  className?: string;
}

export default function SectionTag({ label, className = '' }: SectionTagProps) {
  return (
    <div className={`section-tag ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-sun" />
      {label}
    </div>
  );
}
