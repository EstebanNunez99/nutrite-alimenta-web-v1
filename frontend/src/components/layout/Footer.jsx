// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Sobre Mi Tienda</h4>
          <p className={styles.footerText}>
            La mejor tienda online para encontrar todo lo que necesitás.Por ahora en modo desarroll.
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
          <h4 className={styles.footerTitle}>Mis Redes</h4>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/esteban.ignacio.1460/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/esteban_nnunez/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://x.com/Estebannunex" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Contactáme</h4>
          <div className={styles.socialIcons}>
            <a href="mailto:nunezesteban750@gmail.com?subject=Consulta desde tu tienda online" aria-label="Enviar un correo electrónico">
              <MdOutlineMail />
            </a>
            <a href="https://wa.me/qr/UNO32CGW2ZE6D1" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaWhatsapp />
            </a>
            <a href="https://t.me/+543781408870" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTelegram />
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
