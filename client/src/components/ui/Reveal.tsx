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
 * "/", before anything paints, for every visitor: a reduced-motion
 * preference gets a calmer version of it from the CSS, not no opening at
 * all. The preloader takes it down itself and flags that it is running; the
 * timeout here is only a backstop for when the page's scripts never run, so
 * nobody is left looking at it.
 *
 * A page that loads where nobody can see it — a tab opened in the
 * background, or one the browser prerendered on a guess — would otherwise
 * play its whole entrance to an empty room and be found already still.
 * data-wait holds every animation (see globals.css) until it is first shown,
 * and the backstop's clock only starts then too.
 */
export const REVEAL_SCRIPT = `(function(){
var root=document.documentElement;
try{
var intro=location.pathname==="/";
var seen=function(){return document.visibilityState!=="hidden"&&!document.prerendering;};
var backstop=function(){
setTimeout(function(){
if(window.__kIntroRunning||root.getAttribute("data-intro")!=="play")return;
root.setAttribute("data-intro","leaving");
setTimeout(function(){root.setAttribute("data-intro","done");},1500);
},12000);
};
if(intro)root.setAttribute("data-intro","play");
if(seen()){if(intro)backstop();}
else{
root.setAttribute("data-wait","");
var go=function(){
if(!seen())return;
root.removeAttribute("data-wait");
document.removeEventListener("visibilitychange",go);
document.removeEventListener("prerenderingchange",go);
if(intro)backstop();
};
document.addEventListener("visibilitychange",go);
document.addEventListener("prerenderingchange",go);
}
}catch(e){root.removeAttribute("data-intro");root.removeAttribute("data-wait");}
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
