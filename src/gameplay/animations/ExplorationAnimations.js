/**
 * ExplorationAnimations.js
 * 
 * This file contains all the animations for the exploration scene
 */

/**
 * Simple fade-in animation for entity entrance
 * @param {HTMLElement} section - The character section element
 * @param {string} targetPosition - Target position (e.g., '0vw', '15vw')
 * @param {string} direction - 'left' or 'right' - which side to enter from
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function FadeInAnimation(section, targetPosition = '0vw', direction = 'left') {
    // Set initial state
    section.style.visibility = 'visible';
    section.style.opacity = '0';
    section.style.transform = `translateX(${targetPosition}) scale(0.95)`;
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    
    // Trigger animation
    await new Promise(resolve => setTimeout(resolve, 50));
    section.style.opacity = '1';
    section.style.transform = `translateX(${targetPosition}) scale(1)`;
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 600));
}

/**
 * Slide-in animation for entity entrance
 * @param {HTMLElement} section - The character section element
 * @param {string} targetPosition - Target position (e.g., '0vw', '15vw')
 * @param {string} direction - 'left' or 'right' - which side to enter from
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function SlideInAnimation(section, targetPosition = '0vw', direction = 'left') {
    const enterFrom = direction === 'left' ? '-50vw' : '50vw';
    
    // Set initial state
    section.style.visibility = 'visible';
    section.style.opacity = '0';
    section.style.transform = `translateX(${enterFrom})`;
    section.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
    
    // Trigger animation
    await new Promise(resolve => setTimeout(resolve, 50));
    section.style.opacity = '1';
    section.style.transform = `translateX(${targetPosition})`;
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Fade-out animation for entity exit
 * @param {HTMLElement} section - The character section element
 * @param {string} targetPosition - Not used for exit animations
 * @param {string} direction - 'left' or 'right' - which side to exit to
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function FadeOutAnimation(section, targetPosition = '0px', direction = 'left') {
    // Animate fade out
    section.style.transition = 'opacity 0.6s ease-in, transform 0.6s ease-in';
    section.style.opacity = '0';
    section.style.transform = 'scale(0.95)';
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Hide section
    section.style.visibility = 'hidden';
}

/**
 * Slide-out animation for entity exit
 * @param {HTMLElement} section - The character section element
 * @param {string} targetPosition - Not used for exit animations
 * @param {string} direction - 'left' or 'right' - which side to exit to
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function SlideOutAnimation(section, targetPosition = '0vw', direction = 'left') {
    const exitTo = direction === 'left' ? '-50vw' : '50vw';
    
    // Animate slide out
    section.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
    section.style.opacity = '0';
    section.style.transform = `translateX(${exitTo})`;
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Hide section
    section.style.visibility = 'hidden';
}
