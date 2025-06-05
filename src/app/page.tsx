"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FaLeaf,
  FaUsers,
  FaChartLine,
  FaCloudSun,
  FaRobot,
  FaMobileAlt,
  FaShieldAlt,
  FaStar,
  FaWhatsapp,
  FaArrowRight,
  FaPlay,
  FaCheck,
} from "react-icons/fa";
import { JSX } from "react";

export default function AgriSmart() {
  const stats = [
    { value: 1000, suffix: "+", label: "Agriculteurs actifs" },
    { value: 95, suffix: "%", label: "Satisfaction client" },
    { value: 24, suffix: "h", label: "Support disponible" },
  ];

  const features = [
    {
      icon: <FaUsers />,
      title: "Réseau Collaboratif",
      description:
        "Connectez-vous avec une communauté d'agriculteurs passionnés, partagez vos expériences et apprenez des meilleurs pratiques du secteur.",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics Avancés",
      description:
        "Analysez vos performances avec des tableaux de bord intelligents et des insights basés sur l'IA pour optimiser vos rendements.",
    },
    {
      icon: <FaCloudSun />,
      title: "Météo Intelligente",
      description:
        "Accédez à des prévisions météorologiques ultra-précises et des alertes personnalisées pour planifier au mieux vos activités.",
    },
    {
      icon: <FaRobot />,
      title: "Assistant IA",
      description:
        "Bénéficiez de conseils personnalisés grâce à notre intelligence artificielle qui apprend de vos habitudes et optimise vos décisions.",
    },
    {
      icon: <FaMobileAlt />,
      title: "Mobile First",
      description:
        "Accédez à toutes les fonctionnalités depuis votre smartphone, même hors ligne, pour rester connecté où que vous soyez.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Sécurité Maximale",
      description:
        "Vos données sont protégées par un chiffrement de niveau bancaire et des protocoles de sécurité de dernière génération.",
    },
  ];

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[url('/image/home.jpeg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-4xl md:text-4xl font-extrabold mb-6 text-white leading-tight drop-shadow-xl">
              L'avenir de l'
              <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                agriculture
              </span>
              <br />
              commence ici
            </h1>
            <p className="text-base sm:text-base md:text-base text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
              Révolutionnez votre pratique agricole avec AgriSmart, la plateforme intelligente qui connecte les agriculteurs du Bénin à l'innovation technologique.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-2 rounded-full font-semibold transition-transform duration-300 shadow-lg hover:scale-105 hover:shadow-xl flex items-center justify-center">
                Commencer gratuitement
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
            <button className="w-full sm:w-auto bg-white/20 text-white px-8 py-2 rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
              <FaPlay className="mr-2" />
              Voir la démo
            </button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <StatItem key={index} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center tracking-tight">
            À propos de{" "}
            <span className="text-green-500 underline underline-offset-4 decoration-wavy">
              AgriSmart
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                Dans un monde où l'agriculture évolue rapidement, AgriSmart vous donne les outils pour rester à la pointe. Notre plateforme combine intelligence artificielle, données météorologiques précises et communauté engagée pour transformer votre approche agricole.
              </p>
              <div className="space-y-6">
                <FeatureItem text="Interface intuitive et facile d'utilisation" />
                <FeatureItem text="Données en temps réel fiables et précises" />
                <FeatureItem text="Communauté active d'agriculteurs experts" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatCard value="250%" color="bg-green-100 text-green-600" label="Augmentation des revenus" />
              <StatCard value="60%" color="bg-emerald-100 text-emerald-600" label="Réduction des pertes" />
              <StatCard value="40h" color="bg-green-100 text-green-600" label="Temps économisé/mois" />
              <StatCard value="99.9%" color="bg-emerald-100 text-emerald-600" label="Disponibilité plateforme" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center tracking-tight">
            Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-500 text-white text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
            Prêt à révolutionner votre agriculture ?
          </h2>
          <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez des milliers d'agriculteurs qui ont déjà transformé leur activité avec AgriSmart. L'inscription est gratuite et ne prend que 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-green-700 hover:text-green-800 px-8 py-4 rounded-full font-semibold transition-transform duration-300 shadow-lg hover:scale-105 hover:shadow-xl">
                Commencer maintenant
                <FaArrowRight className="ml-2 inline" />
              </button>
            </Link>
            <button className="w-full sm:w-auto bg-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center justify-center">
              <FaWhatsapp className="mr-3" />
              Contacter un expert
            </button>
          </div>

          <div className="mt-12">
            <p className="mb-4">✓ Inscription gratuite • ✓ Pas de frais cachés • ✓ Support 24/7</p>
            <div className="flex flex-col xs:flex-row justify-center items-center space-y-4 xs:space-y-0 xs:space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <FaStar className="text-yellow-300" />
                </div>
                <span>4.9/5 étoiles</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <FaUsers className="text-blue-300" />
                </div>
                <span>1000+ utilisateurs</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Composant StatItem
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounter();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounter = () => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
  };

  return (
    <div className="text-center" ref={ref}>
      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
        {count}
        {suffix}
      </div>
      <div className="text-gray-300 text-sm">{label}</div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
        <FaCheck className="text-white" />
      </div>
      <span className="text-base sm:text-lg text-gray-700">{text}</span>
    </div>
  );
}

function StatCard({ value, color, label }: { value: string; color: string; label: string }) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl text-center ${color} hover:shadow-md transition-shadow duration-300`}>
      <div className="text-2xl sm:text-3xl font-bold mb-2">{value}</div>
      <div className="text-xs sm:text-sm">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl shadow-md bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
      <div className="text-green-500 text-4xl sm:text-5xl mb-4 sm:mb-5 mx-auto group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  );
}