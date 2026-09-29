import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ScrollTrigger drives the pinned "How I work" story and the hero's scroll
// parallax. Character reveals are rendered by React (see Chars) and animated
// with plain tweens, so React stays the owner of the DOM it renders.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
