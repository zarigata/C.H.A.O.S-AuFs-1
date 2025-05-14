interface ChaosLogoProps {
  className?: string
}

export function ChaosLogo({ className = "w-6 h-6" }: ChaosLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#245EDC" stroke="white" />
      <path d="M7 9a5 5 0 0 0 10 0M7 15a5 5 0 0 0 10 0" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" fill="#1C3E9C" stroke="white" strokeWidth="1" />
    </svg>
  )
}
