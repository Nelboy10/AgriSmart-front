"use client";

import Link from "next/link";
import {
  FaHandsHelping,
  FaChartLine,
  FaCloudSun,
  FaUserTie,
  FaCamera,
  FaMobileAlt,
} from "react-icons/fa";
import { JSX } from "react/jsx-dev-runtime";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-sans">
      {/* Hero */}
      <section
        className="relative h-[90vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/image/home.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 px-6 text-center max-w-3xl animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight tracking-wide drop-shadow-xl">
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
              AgriSmart
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 font-light">
            Connecter les agriculteurs du Bénin pour une agriculture plus intelligente 🌱
          </p>
          <Link href="/auth/register">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-transform duration-300 shadow-lg hover:scale-105 hover:shadow-xl">
              Commencer maintenant
            </button>
          </Link>
        </div>
      </section>

      {/* À propos */}
      <section className="py-24 px-6 md:px-20">
        <h2 className="text-4xl font-bold mb-8 text-center tracking-tight">
          À propos de{" "}
          <span className="text-green-500 underline underline-offset-4 decoration-wavy">
            AgriSmart
          </span>
        </h2>
        <p className="text-center max-w-3xl mx-auto text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          AgriSmart est une plateforme pensée pour les agriculteurs du Bénin. Elle facilite l'accès à
          des informations agricoles fiables, aux marchés locaux, aux prévisions météo, et à une
          communauté engagée pour un avenir agricole durable.
        </p>
      </section>

      {/* Fonctionnalités */}
      <section className="py-24 px-6 md:px-20 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-4xl font-bold mb-14 text-center tracking-tight">
          Fonctionnalités principales
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <Feature
            icon={<FaHandsHelping />}
            title="Connexion entre agriculteurs"
            description="Connectez-vous avec d'autres agriculteurs pour partager conseils et expériences."
          />
          <Feature
            icon={<FaChartLine />}
            title="Suivi des prix du marché"
            description="Accédez aux prix du marché en temps réel pour maximiser vos revenus."
          />
          <Feature
            icon={<FaCloudSun />}
            title="Prévisions météo"
            description="Des données météo précises pour mieux planifier vos activités agricoles."
          />
          <Feature
            icon={<FaUserTie />}
            title="Assistance technique"
            description="Un accompagnement expert pour relever les défis quotidiens."
          />
          <Feature
            icon={<FaCamera />}
            title="Partage d’expériences"
            description="Montrez vos récoltes, apprenez des réussites de vos pairs."
          />
          <Feature
            icon={<FaMobileAlt />}
            title="Accès mobile"
            description="Une plateforme 100% responsive, utilisable partout."
          />
        </div>
      </section>

      {/* Call to action */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-green-500 text-white text-center px-6">
        <h2 className="text-4xl font-bold mb-6 tracking-tight">
          Rejoignez la communauté AgriSmart
        </h2>
        <p className="mb-8 text-lg">
          Inscrivez-vous gratuitement et faites partie du futur de l’agriculture au Bénin.
        </p>
        <Link href="/auth/login">
          <button className="bg-white text-green-700 hover:text-green-800 px-8 py-3 rounded-full font-semibold transition-transform duration-300 shadow-md hover:shadow-xl hover:scale-105">
            S'inscrire maintenant
          </button>
        </Link>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-3xl shadow-md bg-white dark:bg-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
      <div className="text-green-500 text-5xl mb-5 mx-auto group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
