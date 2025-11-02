// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Sobre Mi Tienda</h4>
          <p className={styles.footerText}>
            La mejor tienda online para encontrar todo lo que necesitás. Calidad y buen precio en un solo lugar.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Navegación</h4>
          <ul className={styles.navList}>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Catálogo</Link></li>
            <li><Link to="/perfil">Mi Perfil</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Seguinos</h4>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>
          &copy; {new Date().getFullYear()} <span> Todos los derechos reservados. </span> Diseñado y desarrollado por Esteban Nuñez.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
