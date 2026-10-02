import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Watches every [data-reveal] element and marks it `data-shown` the first
 * time it scrolls into view. It runs inline from the root layout, ahead of
 * the page's own scripts, so reveals never wait on hydration; and because
 * the hidden starting states in globals.css only apply once it has set
 * `data-js`, a browser that never runs it shows everything as normal.
 * The mutation observer picks up elements that arrive later, by streaming
 * or by client-side navigation.
 *
 * It also raises the home page preloader (see Preloader) on a full load of
 * "/", before anything paints. The preloader takes it down itself; the
 * timeout here is only a backstop, so that if the page's scripts never run
 * nobody is left looking at it.
 */
export const REVEAL_SCRIPT = `(function(){
var root=document.documentElement;
if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
root.setAttribute("data-intro","play");
setTimeout(function(){if(root.getAttribute("data-intro")==="play")root.setAttribute("data-intro","done");},12000);
}
if(!("IntersectionObserver" in window)||!("MutationObserver" in window))return;
root.setAttribute("data-js","");
var io=new IntersectionObserver(function(entries){
entries.forEach(function(e){
if(!e.isIntersecting)return;
e.target.setAttribute("data-shown","");
io.unobserve(e.target);
});
},{rootMargin:"0px 0px -6% 0px"});
function scan(node){
if(node.nodeType!==1)return;
if(node.hasAttribute("data-reveal"))io.observe(node);
node.querySelectorAll("[data-reveal]").forEach(function(el){io.observe(el);});
}
new MutationObserver(function(records){
records.forEach(function(r){r.addedNodes.forEach(scan);});
}).observe(root,{childList:true,subtree:true});
scan(root);
})();`;

type Props = {
  as?: ElementType;
  /** Milliseconds to hold back, for staggering siblings. */
  delay?: number;
  className?: string;
  children?: ReactNode;
};

/**
 * A scroll-reveal boundary. It does no animating of its own: the rv-*
 * classes in globals.css, placed on it or on anything inside it, play once
 * REVEAL_SCRIPT marks it shown.
 */
export function Reveal({ as: Tag = "div", delay = 0, className, children }: Props) {
  return (
    <Tag
      data-reveal=""
      // data-shown is added outside React, possibly before hydration.
      suppressHydrationWarning
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
