'use client'

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './UniversitySlider.module.css';

const universities = [
  { name: 'Stanford', logo: '/logos/stanford.png' },
  { name: 'Harvard', logo: '/logos/harvard.png' },
  { name: 'UVA', logo: '/logos/uva.png' },
  { name: 'UCLA', logo: '/logos/ucla.png' },
  { name: 'USC', logo: '/logos/usc.png' },
  { name: 'Miami', logo: '/logos/miami.png' },
  { name: 'Ohio State', logo: '/logos/osu.png' },
  { name: 'Auburn', logo: '/logos/auburn.png' },
  { name: 'USF', logo: '/logos/usf.png' },
  { name: 'Alabama', logo: '/logos/alabama.png' },
  { name: 'Berkeley', logo: '/logos/berkeley.png' },
  { name: 'Texas', logo: '/logos/texas.png' },
  { name: 'Florida', logo: '/logos/florida.png' },
  { name: 'Clemson', logo: '/logos/clemson.png' },
  { name: 'South Carolina', logo: '/logos/south-carolina.png' },
  { name: 'Georgia', logo: '/logos/georgia.png' },
  { name: 'Oklahoma', logo: '/logos/oklahoma.png' },
];

const UniversitySlider: React.FC = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateOpacity = () => {
            if (sliderRef.current) {
                const slides = sliderRef.current.getElementsByClassName(styles.slide);
                const containerWidth = sliderRef.current.offsetWidth;
                const centerX = containerWidth / 2;

                Array.from(slides).forEach((slide) => {
                    const rect = slide.getBoundingClientRect();
                    const slideCenter = rect.left + rect.width / 2;
                    const distance = Math.abs(centerX - slideCenter);
                    const maxDistance = containerWidth / 2;
                    const opacity = 1 - Math.min(distance / maxDistance, 0.3);
                    (slide.firstChild as HTMLElement).style.opacity = opacity.toString();
                });
            }
        };

        updateOpacity();
        window.addEventListener('resize', updateOpacity);
        const intervalId = setInterval(updateOpacity, 16);

        return () => {
            window.removeEventListener('resize', updateOpacity);
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div className={`${styles.sliderContainer} h-full flex items-center overflow-hidden`} ref={sliderRef}>
            <div className={`${styles.slider} w-full flex`}>
                {[...universities, ...universities].map((uni, index) => (
                    <div key={index} className={`${styles.slide} flex-shrink-0 flex items-center justify-center`}>
                        <Image 
                            src={uni.logo} 
                            alt={uni.name} 
                            width={80}
                            height={80}
                            priority={index < 5}
                            loading={index < 5 ? "eager" : "lazy"}
                            className="object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UniversitySlider;