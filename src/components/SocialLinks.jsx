import { motion } from "motion/react";
import { FaFileArrowDown } from "react-icons/fa6";
import { socials, profile } from "../data/profile";

const links = [
  ...socials.filter((s) => s.quickLink),
  { id: "cv", title: "CV", Icon: FaFileArrowDown, href: profile.cvUrl },
];

export default function SocialLinks({ className = "" }) {
  return (
    <nav className={`social ${className}`} aria-label="Quick links">
      {links.map(({ id, title, Icon, href }, i) => (
        <motion.a
          key={id}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="social__link"
          aria-label={title}
          title={title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6 + i * 0.08 } }}
          whileHover={{ y: -3, rotate: -6 }}
          whileTap={{ scale: 0.92 }}
        >
          <Icon aria-hidden="true" />
        </motion.a>
      ))}
    </nav>
  );
}
