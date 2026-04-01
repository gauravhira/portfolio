export default function Footer() {
  return (
    <footer className="text-center py-6 px-[5%] text-[12px]"
      style={{ background: "#080B10", color: "rgba(255,255,255,0.3)" }}>
      Built by Gaurav Hira ·{" "}
      <a href="https://gigafitmeals.com" target="_blank" rel="noopener noreferrer"
        className="text-[--cyan2] hover:underline">
        gigafitmeals.com
      </a>
    </footer>
  );
}
