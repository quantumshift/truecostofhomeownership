export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden="true">
        <path
          d="M15 1L28 6.5V16C28 24.5 22.5 30.8 15 33C7.5 30.8 2 24.5 2 16V6.5L15 1Z"
          fill="#003366"
        />
        <path d="M15 6L23 9.4V16C23 21.6 19.7 25.7 15 27.3C10.3 25.7 7 21.6 7 16V9.4L15 6Z" fill="#0a5ca8" />
      </svg>
      <span className="font-semibold text-navy leading-tight text-[15px]">
        Empire Home Loans
      </span>
    </div>
  );
}
