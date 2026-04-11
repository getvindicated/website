import Image from "next/image";

export function RoadScene() {
  const stars = [
    { top: 12, left: "8%", w: 2, delay: 0, dur: 2.2 },
    { top: 22, left: "25%", w: 1.5, delay: 0.8, dur: 2.8 },
    { top: 8, left: "55%", w: 2, delay: 1.2, dur: 1.9 },
    { top: 28, left: "75%", w: 1, delay: 0.3, dur: 3.1, color: "#b088cc" },
    { top: 15, left: "90%", w: 1.5, delay: 1.6, dur: 2.4 },
  ];

  const stripeDelays = [0, -0.56, -1.12, -1.68, -2.24];

  return (
    <div
      className="relative overflow-hidden mt-[65px] h-[220px] bg-[linear-gradient(180deg,#0d0814_0%,#0d0814_65%)]"
    >
      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0 b-[58px] h-[30x] bg-[radial-gradient(ellipse_60%_100%,rgba(124,58,237,0.25)_0%,transparent_70%)]"
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full star"
          style={{
            top: s.top,
            left: s.left,
            width: s.w,
            height: s.w,
            background: s.color ?? "#fff",
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}

      {/* Road */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] h-[68px] bg-[#3f234a]"
      >
        {stripeDelays.map((delay, i) => (
          <div
          key={i}
          className="absolute road-stripe bottom-[30px] h-[5px] w-[72px] bg-[#c9a84c] rounded-[2px]"
          style={{
            animationDelay: `${delay}s`,
          }}
          />
        ))}
      </div>

      {/* Driving car */}
      <div className="absolute z-[5] car-drive bottom-[-15px]">
        <Image
          src="/illus-car-purple.png"
          alt="Purple car"
          width={320}
          height={180}
          className="h-[180px] w-auto block"
        />
      </div>
    </div>
  );
}
