import Link from "next/link";
import { FaGithub, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#030303] border-t border-purple-900/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="text-white font-bold text-2xl mb-4 block">
              CollabNext
            </Link>
            <p className="text-gray-400 mb-4">
              Empowering creators with AI-driven tools and seamless
              collaboration.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<FaTwitter size={18} />} />
              <SocialIcon icon={<FaGithub size={18} />} />
              <SocialIcon icon={<FaInstagram size={18} />} />
              <SocialIcon icon={<FaLinkedin size={18} />} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} NUCLITRON. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href?: string }) => {
  return (
    <a
      href={href}
      className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-purple-900/20 hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
};

const FooterLinks = ({ links }: { links: { href: string; label: string }[] }) => {
  return (
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Footer;
