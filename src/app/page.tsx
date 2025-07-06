"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { JSX } from "react";
import AgriBotButton from "@/components/AgriBotButton";

import {
  FaUsers,
  FaChartLine,
  FaCloudSun,
  FaRobot,
  FaMobileAlt,
  FaShieldAlt,
  FaStar,
  FaWhatsapp,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";

export default function AgriSmart() {
  const stats = [
    { value: 1000, suffix: "+", label: "Agriculteurs actifs" },
    { value: 95, suffix: "%", label: "Satisfaction client" },
    { value: 24, suffix: "h", label: "Support disponible" },
  ];


  const features = [
    {
      icon: <FaUsers className="group-hover:text-green-500 transition-colors" />,
      title: "Réseau Collaboratif",
      description:
        "Connectez-vous avec une communauté d'agriculteurs passionnés, partagez vos expériences et apprenez des meilleurs pratiques du secteur.",
    },
    {
      icon: <FaChartLine className="group-hover:text-green-500 transition-colors" />,
      title: "Analytics Avancés",
      description:
        "Analysez vos performances avec des tableaux de bord intelligents et des insights basés sur l'IA pour optimiser vos rendements.",
    },
    {
      icon: <FaCloudSun className="group-hover:text-green-500 transition-colors" />,
      title: "Météo Intelligente",
      description:
        "Accédez à des prévisions météorologiques ultra-précises et des alertes personnalisées pour planifier au mieux vos activités.",
    },
    {
      icon: <FaRobot className="group-hover:text-green-500 transition-colors" />,
      title: "Assistant IA",
      description:
        "Bénéficiez de conseils personnalisés grâce à notre intelligence artificielle qui apprend de vos habitudes et optimise vos décisions.",
    },
    {
      icon: <FaMobileAlt className="group-hover:text-green-500 transition-colors" />,
      title: "Mobile First",
      description:
        "Accédez à toutes les fonctionnalités depuis votre smartphone, même hors ligne, pour rester connecté où que vous soyez.",
    },
    {
      icon: <FaShieldAlt className="group-hover:text-green-500 transition-colors" />,
      title: "Sécurité Maximale",
      description:
        "Vos données sont protégées par un chiffrement de niveau bancaire et des protocoles de sécurité de dernière génération.",
    },
  ];

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden dark:bg-gray-900/80 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[url('/image/home.jpeg')] bg-cover bg-center pt-30 pb-20">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight drop-shadow-xl animate-slideInDown">
              L'avenir de l'
              <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
                agriculture
              </span>
              <br />
              commence ici
            </h1>
            <p className="text-lg sm:text-xl md:text-xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-100">
              Révolutionnez votre pratique agricole avec AgriSmart, la plateforme intelligente qui connecte les agriculteurs du Bénin à l'innovation technologique.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 animate-fadeIn delay-200 ">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl flex items-center justify-center hover:from-green-600 hover:to-emerald-700">
                Commencer gratuitement
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
            <Link href="/home">
              <button className="w-full sm:w-auto bg-white/20 text-white px-8 py-3 rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-white/30">
                <FaArrowRight className="mr-2" />
                  Accéder à mon feed
              </button>
            </Link> 
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fadeInUp delay-300">
            {stats.map((stat, index) => (
              <StatItem key={index} value={stat.value} suffix={stat.suffix} label={stat.label} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 md:px-20 bg-white dark:bg-gray-900/80 dark:text-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center tracking-tight animate-fadeIn">
            À propos de{" "}
            <span className="text-green-500 underline underline-offset-4 decoration-wavy dark:text-green-400">
              AgriSmart
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInLeft">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed dark:text-gray-50">
                Dans un monde où l'agriculture évolue rapidement, AgriSmart vous donne les outils pour rester à la pointe. Notre plateforme combine intelligence artificielle, données météorologiques précises et communauté engagée pour transformer votre approche agricole.
              </p>
              <div className="space-y-6">
                <FeatureItem text="Interface intuitive et facile d'utilisation" />
                <FeatureItem text="Données en temps réel fiables et précises" />
                <FeatureItem text="Communauté active d'agriculteurs experts" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 animate-fadeInRight dark:bg-gray-900/80 dark:text-gray-50">
              <StatCard value="250%" color="bg-green-100 text-green-600" label="Augmentation des revenus" />
              <StatCard value="60%" color="bg-emerald-100 text-emerald-600" label="Réduction des pertes" />
              <StatCard value="40h" color="bg-green-100 text-green-600" label="Temps économisé/mois" />
              <StatCard value="99.9%" color="bg-emerald-100 text-emerald-600" label="Disponibilité plateforme" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 md:px-20 bg-gray-50 dark:bg-gray-900/80 dark:text-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center tracking-tight animate-fadeIn">
            Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 dark:bg-gray-900/80 dark:text-gray-100">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-400 to-green-500 text-white text-center px-4 sm:px-6 dark:bg-gray-900/80 dark:text-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight animate-fadeIn">
            Prêt à révolutionner votre agriculture ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeIn delay-100">
            Rejoignez des milliers d'agriculteurs qui ont déjà transformé leur activité avec AgriSmart. L'inscription est gratuite et ne prend que 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fadeIn delay-200">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-green-700 hover:text-green-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl">
                Commencer maintenant
                <FaArrowRight className="ml-2 inline transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="w-full sm:w-auto bg-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <FaWhatsapp className="mr-3" />
              Contacter un expert
            </button>
          </div>

          <div className="mt-12 animate-fadeIn delay-300 dark:text-gray-50">
            <p className="mb-4">✓ Inscription gratuite • ✓ Pas de frais cachés • ✓ Support 24/7</p>
            <div className="flex flex-col xs:flex-row justify-center items-center space-y-4 xs:space-y-0 xs:space-x-8 text-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                  <FaStar className="text-yellow-300 animate-pulse" />
                </div>
                <span>4.9/5 étoiles</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                  <FaUsers className="text-blue-300" />
                </div>
                <span>1000+ utilisateurs</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AgriBotButton />
    </div>
  );
}

// Composant StatItem
function StatItem({ value, suffix, label, delay = 0 }: { value: number; suffix: string; label: string; delay?: number }) {
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
    const duration = 1500;
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
    <div 
      className="text-center" 
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
        {count}
        {suffix}
      </div>
      <div className="text-gray-300 text-sm mt-2">{label}</div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-4 group dark:text-gray-50">
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-green-600 group-hover:scale-110">
        <FaCheck className="text-white" />
      </div>
      <span className="text-lg text-gray-700 transition-all duration-300 group-hover:text-gray-900 dark:text-gray-50">{text}</span>
    </div>
  );
}

function StatCard({ value, color, label }: { value: string; color: string; label: string }) {
  return (
    <div className={`p-6 rounded-2xl text-center ${color} hover:shadow-md transition-all duration-300 hover:-translate-y-1  dark:bg-gray-700/80 dark:border-gray-700 dark:text-gray-50`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0
}: {
  icon: JSX.Element;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <div 
      className="p-8 rounded-3xl shadow-md bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group border border-gray-100 dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-50"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="text-green-500 text-5xl mb-5 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-green-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-green-600 dark:text-gray-50">{title}</h3>
      <p className="text-gray-600 transition-all duration-300 group-hover:text-gray-800 dark:text-gray-50">{description}</p>
    </div>
  );
}



