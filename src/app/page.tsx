"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { drivers2025, teams } from "@/data/drivers";
import { calendar2025, getNextRace, getTimeUntilRace } from "@/data/calendar";
import { f1Basics } from "@/data/watch";

function CountdownTimer() {
  const nextRace = getNextRace(calendar2025);
  const [time, setTime] = useState(getTimeUntilRace(nextRace!));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilRace(nextRace!));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  if (!nextRace) return null;

  const timeBlocks = [
    { value: time.days, label: "DAYS" },
    { value: time.hours, label: "HRS" },
    { value: time.minutes, label: "MIN" },
    { value: time.seconds, label: "SEC" },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-f1-dark via-f1-carbon to-f1-dark" />
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-f1-cyan font-display text-sm tracking-[0.3em] mb-2"
        >
          NEXT RACE
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-5xl font-bold text-white mb-2"
        >
          {nextRace.officialName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-f1-text-muted text-lg mb-1"
        >
          {nextRace.circuit} — {nextRace.location}, {nextRace.country}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-f1-text-muted text-sm mb-10"
        >
          Round {nextRace.round} of 24 {nextRace.hasSprint ? "• Sprint Weekend 🏃" : ""}
        </motion.p>

        <div className="flex justify-center gap-4 md:gap-6">
          {timeBlocks.map((block, i) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              className="glass rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[100px]"
            >
              <div className="font-display text-3xl md:text-5xl font-bold text-white">
                {String(block.value).padStart(2, "0")}
              </div>
              <div className="text-f1-text-muted text-xs tracking-widest mt-1">
                {block.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) return;
    let start = 0;
    const duration = 2000;
    const stepTime = duration / value;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [hasAnimated, value]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setHasAnimated(true)}
      viewport={{ once: true }}
    >
      <div className="font-display text-4xl md:text-6xl font-bold text-white">
        {count}{suffix}
      </div>
      <div className="text-f1-text-muted text-sm tracking-widest mt-2 uppercase">{label}</div>
    </motion.div>
  );
}

export default function HomePage() {
  const featuredDrivers = drivers2025.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="Formula 1 car racing at night"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-f1-dark/60 via-f1-dark/40 to-f1-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-f1-dark/80 via-transparent to-f1-dark/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-f1-cyan font-display text-xs tracking-[0.4em]">
              THE 75TH ANNIVERSARY SEASON
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6"
          >
            THE WORLD OF
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-f1-red via-orange-500 to-f1-cyan">
              FORMULA 1
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-f1-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Drivers. Teams. Circuits. Championships. Everything you need to dive into
            the fastest sport on the planet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/drivers"
              className="px-8 py-3.5 rounded-xl bg-f1-red hover:bg-red-700 text-white font-semibold transition-all duration-300 hover:glow-red hover:scale-105"
            >
              Meet the Drivers
            </Link>
            <Link
              href="/watch"
              className="px-8 py-3.5 rounded-xl glass text-white font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Where to Watch →
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-3 rounded-full bg-f1-red" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-4 carbon-texture">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={24} label="Grand Prix Races" />
          <StatCounter value={10} label="Teams" />
          <StatCounter value={20} label="Drivers" />
          <StatCounter value={75} label="Years of Racing" suffix="+" />
        </div>
      </section>

      {/* What is F1 */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">FOR NEWCOMERS</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              What is Formula 1?
            </h2>
            <p className="text-f1-text-muted text-lg max-w-3xl mb-12 leading-relaxed">
              {f1Basics.whatIsF1}
            </p>
          </motion.div>

          {/* Race weekend format */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                🏁 Standard Race Weekend
              </h3>
              {f1Basics.raceWeekendFormat.map((day) => (
                <div key={day.day} className="mb-3 last:mb-0">
                  <p className="text-f1-cyan font-display text-xs tracking-widest mb-1">{day.day.toUpperCase()}</p>
                  {day.sessions.map((s) => (
                    <p key={s} className="text-f1-text text-sm pl-4 py-0.5">• {s}</p>
                  ))}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 border-f1-cyan/20"
            >
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                🏃 Sprint Race Weekend
              </h3>
              {f1Basics.sprintWeekendFormat.map((day) => (
                <div key={day.day} className="mb-3 last:mb-0">
                  <p className="text-f1-cyan font-display text-xs tracking-widest mb-1">{day.day.toUpperCase()}</p>
                  {day.sessions.map((s) => (
                    <p key={s} className="text-f1-text text-sm pl-4 py-0.5">• {s}</p>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Points system */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 mb-16"
          >
            <h3 className="font-display text-lg font-bold text-white mb-6">Points System</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {f1Basics.howPointsWork.map((pos) => (
                <div key={pos.position} className="text-center p-3 rounded-xl bg-f1-dark/50">
                  <div className="text-2xl font-bold text-white font-display">{pos.points}</div>
                  <div className="text-xs text-f1-text-muted mt-1">{pos.position}</div>
                </div>
              ))}
            </div>
            <p className="text-f1-text-muted text-xs mt-4">* Fastest lap point only awarded if driver finishes in the top 10</p>
          </motion.div>

          {/* Key Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-lg font-bold text-white mb-6">F1 Glossary</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {f1Basics.keyTerms.map((term, i) => (
                <motion.div
                  key={term.term}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl p-4 hover:bg-f1-surface-hover transition-colors"
                >
                  <p className="font-display text-sm font-bold text-f1-cyan mb-1">{term.term}</p>
                  <p className="text-f1-text-muted text-sm leading-relaxed">{term.definition}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Drivers */}
      <section className="py-24 px-4 bg-gradient-to-b from-f1-dark to-f1-carbon">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-f1-red font-display text-sm tracking-[0.3em] mb-3">2025 GRID</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Featured Drivers
              </h2>
            </div>
            <Link
              href="/drivers"
              className="text-f1-cyan hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              View All Drivers →
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredDrivers.map((driver, i) => {
              const teamColor = teams[driver.teamId];
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-5 hover:scale-[1.03] transition-all duration-300 group cursor-pointer"
                  style={{ borderTop: `3px solid ${teamColor?.color}` }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold text-white mb-3"
                    style={{ background: `${teamColor?.color}30` }}
                  >
                    {driver.number}
                  </div>
                  <h3 className="font-display text-sm font-bold text-white group-hover:text-f1-cyan transition-colors">
                    {driver.firstName}
                  </h3>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-f1-cyan transition-colors">
                    {driver.lastName}
                  </h3>
                  <p className="text-f1-text-muted text-xs mt-1">{driver.team}</p>
                  <p className="text-f1-text-muted text-xs">{driver.nationality} {driver.countryCode === "GB" ? "🇬🇧" : driver.countryCode === "AU" ? "🇦🇺" : driver.countryCode === "NL" ? "🇳🇱" : driver.countryCode === "JP" ? "🇯🇵" : driver.countryCode === "MC" ? "🇲🇨" : driver.countryCode === "IT" ? "🇮🇹" : driver.countryCode === "ES" ? "🇪🇸" : driver.countryCode === "CA" ? "🇨🇦" : ""}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link href="/drivers" className="text-f1-cyan text-sm font-medium">View All Drivers →</Link>
          </div>
        </div>
      </section>

      {/* Next Race Countdown */}
      <CountdownTimer />

      {/* Where to Watch CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 checkered-flag opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-f1-cyan font-display text-sm tracking-[0.3em] mb-3">DON&apos;T MISS A RACE</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Where to Watch F1
            </h2>
            <p className="text-f1-text-muted text-lg mb-10 max-w-2xl mx-auto">
              From ESPN in the US to Sky Sports in the UK — find the best way to watch Formula 1 in your country. Plus, get ready for Apple TV+ taking over in 2026.
            </p>
            <Link
              href="/watch"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-f1-red to-red-700 text-white font-display font-bold tracking-wider hover:scale-105 hover:glow-red transition-all duration-300"
            >
              FIND YOUR BROADCAST →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
