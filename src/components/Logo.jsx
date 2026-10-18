export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size * 1.17} viewBox="60 30 392 460" role="img" aria-label="SafeCampus logo">
      <path d="M256 36 L444 108 V250 C444 364 362 444 256 486 C150 444 68 364 68 250 V108 Z" fill="#13A89E" />
      <path d="M256 70 L414 130 V250 C414 345 347 413 256 448 C165 413 98 345 98 250 V130 Z" fill="#0B2545" />
      <polygon points="256,142 352,200 160,200" fill="#fff" />
      <rect x="160" y="204" width="192" height="14" fill="#fff" />
      <rect x="172" y="226" width="24" height="96" fill="#fff" />
      <rect x="220" y="226" width="24" height="96" fill="#fff" />
      <rect x="268" y="226" width="24" height="96" fill="#fff" />
      <rect x="316" y="226" width="24" height="96" fill="#fff" />
      <rect x="158" y="326" width="196" height="16" fill="#fff" />
      <rect x="146" y="346" width="220" height="16" fill="#fff" />
      <circle cx="256" cy="180" r="11" fill="#E8512F" />
    </svg>
  );
}
