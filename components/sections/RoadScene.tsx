import Image from "next/image";

export function RoadScene() {
  const stars = [
    { top: 6, left: "8%", w: 2, delay: 0, dur: 2.2 },
    { top: 14, left: "25%", w: 1.5, delay: 0.8, dur: 2.8 },
    { top: 4, left: "55%", w: 2, delay: 1.2, dur: 1.9 },
    { top: 18, left: "75%", w: 1, delay: 0.3, dur: 3.1, color: "#b088cc" },
    { top: 8, left: "90%", w: 1.5, delay: 1.6, dur: 2.4 },
  ];

  const stripeDelays = [0, -0.56, -1.12, -1.68, -2.24];

  return (
    <div
      className="relative overflow-hidden mt-[65px] max-md:mt-[53px]"
      style={{
        height: 140,
        background: "linear-gradient(180deg, #0d0814 0%, #0d0814 65%)",
      }}
    >
      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: 58,
          height: 30,
          background:
            "radial-gradient(ellipse 60% 100%, rgba(124,58,237,0.25) 0%, transparent 70%)",
        }}
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
        className="absolute bottom-0 left-0 right-0 z-[1]"
        style={{ height: 68, background: "#3f234a" }}
      >
        {stripeDelays.map((delay, i) => (
          <div
            key={i}
            className="absolute road-stripe"
            style={{
              bottom: 30,
              height: 5,
              width: 72,
              background: "#c9a84c",
              borderRadius: 2,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      {/* Driving car */}
      <div className="absolute z-[5] car-drive" style={{ bottom: -10 }}>
        <Image
          src="/illus-car-purple.png"
          alt="Purple car"
          width={240}
          height={135}
          className="max-md:h-[100px] max-md:w-auto"
          style={{ height: 135, width: "auto", display: "block" }}
        />
      </div>
    </div>
  );
}
