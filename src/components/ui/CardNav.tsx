import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

import { GoArrowUpRight } from 'react-icons/go';

type CardNavLink = {
  label: string;
  href?: string;
  ariaLabel?: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: React.ReactNode;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  theme?: 'light' | 'dark';
  ctaHref?: string;
  animate?: boolean;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor,
  menuColor,
  buttonBgColor,
  buttonTextColor,
  theme = 'light',
  ctaHref,
  animate = false
}) => {
  const isDark = theme === 'dark';
  const resolvedBaseColor = baseColor ?? (isDark ? '#171717' : '#ffffff');
  const resolvedMenuColor = menuColor ?? (isDark ? '#ffffff' : '#000000');
  const resolvedButtonBgColor = buttonBgColor ?? (isDark ? '#2563eb' : '#1d4ed8');
  const resolvedButtonTextColor = buttonTextColor ?? '#ffffff';
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const animateRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (animate && animateRef.current) {
        gsap.fromTo(
          animateRef.current,
          { y: -80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: ease || 'power3.out' }
        );
      }
    });

    return () => ctx.revert();
  }, [animate, ease]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string = '#') => {
    e.preventDefault();

    const isAnchor = href.startsWith('#');
    const target = e.currentTarget;

    // Tactile press scaling animation
    gsap.to(target, {
      scale: 0.94,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: () => {
        toggleMenu();

        if (isAnchor) {
          const targetId = href.substring(1);
          const element = document.getElementById(targetId);
          if (element) {
            const container = navRef.current?.closest('.card-nav-container');
            const containerTop = container ? container.getBoundingClientRect().top : 32;
            const closedHeight = 60;
            const gap = 24;
            const offset = containerTop + closedHeight + gap;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const targetScrollTop = elementPosition - offset;

            window.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
          }
        } else if (href !== '#') {
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        }
      }
    });
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (ctaHref) {
      e.preventDefault();
    }
    const target = e.currentTarget;

    gsap.to(target, {
      scale: 0.94,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: () => {
        if (ctaHref) {
          window.location.href = ctaHref;
        }
      }
    });
  };

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div
      className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em] ${className}`}
    >
      <div ref={animateRef} className="w-full">
        <nav
          ref={navRef}
          className={`card-nav ${isExpanded ? 'open' : ''} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]`}
          style={{ backgroundColor: resolvedBaseColor }}
        >
          <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between px-[10px] z-[2]">
            <div
              className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''} group h-10 w-10 flex flex-col items-center justify-center cursor-pointer gap-[6px] transition-opacity duration-300 hover:opacity-70 ml-2`}
              onClick={toggleMenu}
              role="button"
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              tabIndex={0}
              style={{ color: resolvedMenuColor }}
            >
              <div
                className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''
                  } group-hover:opacity-75`}
              />
              <div
                className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''
                  } group-hover:opacity-75`}
              />
            </div>

            <div className="logo-container flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-[1]">
              {typeof logo === 'string' ? (
                <img src={logo} alt={logoAlt} className="logo h-[28px]" />
              ) : (
                logo
              )}
            </div>

            {ctaHref ? (
              <a
                href={ctaHref}
                className="card-nav-cta-button hidden md:inline-flex border-0 rounded-lg px-6 items-center h-10 font-medium cursor-pointer transition-colors duration-300 no-underline justify-center hover:brightness-105"
                style={{ backgroundColor: resolvedButtonBgColor, color: resolvedButtonTextColor }}
                onClick={handleCtaClick}
              >
                Get Started
              </a>
            ) : (
              <button
                type="button"
                className="card-nav-cta-button hidden md:inline-flex border-0 rounded-lg px-6 items-center h-10 font-semibold cursor-pointer transition-colors duration-300 hover:brightness-105"
                style={{ backgroundColor: resolvedButtonBgColor, color: resolvedButtonTextColor }}
                onClick={handleCtaClick}
              >
                Get Started
              </button>
            )}
          </div>

          <div
            className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
              } md:flex-row md:items-end md:gap-[12px]`}
            aria-hidden={!isExpanded}
          >
            {(items || []).slice(0, 3).map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-lg min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
                ref={setCardRef(idx)}
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
              >
                <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
                  {item.label}
                </div>
                <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                  {item.links?.map((lnk, i) => (
                    <a
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] origin-left"
                      href={lnk.href}
                      aria-label={lnk.ariaLabel}
                      onClick={(e) => handleLinkClick(e, lnk.href)}
                    >
                      <GoArrowUpRight className="nav-card-link-icon shrink-0" aria-hidden="true" />
                      {lnk.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default CardNav;
