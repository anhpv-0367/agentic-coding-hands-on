import Icon from "@/components/ui/Icon";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  return (
    <header
      className="px-4 md:px-12 lg:px-36"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "80px",
        backgroundColor: "rgba(11, 15, 18, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "12px",
        paddingBottom: "12px",
      }}
    >
      <Icon
        src="/assets/login/logos/saa-logo.png"
        size={52}
        alt="Sun* Annual Awards 2025"
        style={{ height: "56px", objectFit: "contain" }}
      />
      <LanguageSelector />
    </header>
  );
}
