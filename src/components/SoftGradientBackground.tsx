export default function SoftGradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Base soft background */}
      <div className="absolute inset-0 bg-[#fafafa]" />

      {/* Top right soft violet gradient orb */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(167, 139, 250, 0.45) 0%, rgba(221, 214, 254, 0.2) 50%, transparent 70%)",
        }}
      />

      {/* Top left soft sky/blue gradient orb */}
      <div
        className="absolute -top-20 -left-20 w-[550px] h-[550px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, rgba(199, 210, 254, 0.25) 50%, transparent 70%)",
        }}
      />

      {/* Center-right warm peach/rose orb */}
      <div
        className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(253, 186, 116, 0.4) 0%, rgba(254, 215, 170, 0.2) 50%, transparent 70%)",
        }}
      />

      {/* Bottom center soft emerald/teal orb */}
      <div
        className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(167, 243, 208, 0.5) 0%, rgba(187, 247, 208, 0.2) 60%, transparent 70%)",
        }}
      />

      {/* Delicate grid overlay for technical elegance */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
