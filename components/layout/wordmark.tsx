"use client"; // Not interactive: this keeps the path data out of every page's server payload (it appeared 3x).

import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/*
 * Header/footer logo: the owner’s fieldkitt-header.svg (public/brand/), inlined
 * so it costs no extra request (whole-number coordinates: 1 unit is 0.17px here). "FIG. 01" is left out (2px tall at this size).
 * Ink follows the text colour; the folded corner and dot use the --primary token.
 */
const plate = [
  "M43 28 H126 L157 59 V191 Q157 207 141 207 H43 Q27 207 27 191 V44 Q27 28 43 28 Z",
  "M126 29 V51 Q126 59 134 59 H157",
];
const corner = "M126 29 L157 59 H135 Q126 59 126 50 Z";
const monogram =
  "M56 137 56 136H58Q62 136 64 135Q66 134 67 130L79 72Q80 70 80 68Q80 65 78 64Q76 63 73 63H71L72 62H130L126 82H125Q125 80 125 78Q126 76 126 75Q126 70 123 67Q120 63 114 63H98L90 100H115L115 101H90L84 129Q84 130 84 131Q84 134 85 135Q87 136 91 136H93L93 137Z";
const word =
  "M240 139V138H246Q249 138 251 136Q253 135 253 129V52Q253 46 251 44Q249 43 246 43H240V41H316L316 66H315L315 62Q314 51 309 47Q304 43 293 43H274V87H307V89H274V129Q274 135 276 136Q278 138 281 138H290V139ZM346 53Q342 53 339 51Q336 48 336 43Q336 38 339 36Q342 34 346 34Q350 34 353 36Q355 38 355 43Q355 48 353 51Q350 53 346 53ZM325 139V138H326Q328 138 331 137Q333 136 334 135Q336 133 336 129V75Q336 72 334 70Q333 68 330 68Q328 67 326 67H325V66H357V129Q357 133 358 135Q360 136 362 137Q365 138 367 138H368V139ZM414 140Q397 140 387 130Q378 121 378 103Q378 83 387 74Q396 64 412 64Q427 64 436 72Q444 81 444 97V100H399Q399 121 404 130Q408 139 418 139Q425 139 430 134Q435 129 436 118Q439 119 440 121Q441 122 441 125Q441 129 438 132Q435 136 429 138Q423 140 414 140ZM423 99Q423 86 422 79Q421 72 419 68Q417 65 412 65Q405 65 402 73Q399 80 399 99ZM454 139V138H455Q457 138 459 137Q462 136 463 135Q465 133 465 129V45Q465 41 463 39Q462 37 459 37Q457 36 455 36H454V35H486V129Q486 133 487 135Q489 136 491 137Q494 138 495 138H497V139ZM535 140Q521 140 514 131Q507 122 507 102Q507 82 514 73Q521 64 534 64Q543 64 548 69Q553 73 555 83H555Q555 75 555 68Q555 62 555 58V45Q555 41 553 39Q552 37 549 37Q547 36 545 36H543V35H576V129Q576 133 577 135Q579 136 581 137Q583 138 585 138H587V139H555V120H555Q553 131 548 136Q543 140 535 140ZM541 137Q555 137 555 100Q555 67 540 67Q528 67 528 100Q528 137 541 137ZM593 139V138H595Q597 138 599 137Q601 136 603 135Q604 133 604 129V45Q604 41 603 39Q601 37 599 37Q597 36 595 36H593V35H625V94Q625 97 625 100Q625 103 625 106L652 79Q654 76 655 74Q656 73 656 71Q656 69 652 68Q648 67 640 67V66H673V67Q670 67 667 68Q665 68 662 71Q659 73 654 79L643 90L668 128Q672 134 674 136Q676 138 678 138H678V139H676Q668 139 663 139Q658 138 655 137Q651 136 648 134Q646 131 643 127L629 105L625 108V129Q625 133 627 135Q628 136 631 137Q633 138 635 138H637V139ZM702 53Q699 53 696 51Q693 48 693 43Q693 38 696 36Q699 34 702 34Q706 34 709 36Q712 38 712 43Q712 48 709 51Q706 53 702 53ZM681 139V138H683Q685 138 687 137Q690 136 691 135Q693 133 693 129V75Q693 72 691 70Q689 68 687 68Q685 67 683 67H681V66H714V129Q714 133 715 135Q717 136 719 137Q721 138 723 138H725V139ZM762 140Q753 140 747 136Q742 131 742 119V67H731V66Q745 66 752 60Q759 54 761 43H762V66H780V67H762V125Q762 131 765 134Q767 137 772 137Q776 137 781 136V137Q779 138 774 139Q769 140 762 140Z";
/** The final "t" of Fieldkitt is the first t again, shifted right (as in the owner’s files). */
const tee = word.slice(word.lastIndexOf("M762 140"));

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      translate="no"
      className={cn("inline-flex min-h-11 items-center text-foreground no-underline", className)}
    >
      <svg viewBox="22 23 862 189" aria-hidden="true" focusable="false" className="h-8 w-auto">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d={plate[0]} />
          <path d={plate[1]} />
        </g>
        <path d={corner} className="fill-primary" />
        <path d={monogram} transform="translate(0 18)" fill="currentColor" />
        <path d="M194 35 V199" stroke="currentColor" strokeWidth={2} opacity={0.72} />
        {/* Lowered to sit level with the centred F now that "FIG. 01" is gone. */}
        <g transform="translate(0 24)">
          <path d={word} fill="currentColor" />
          <path d={tee} transform="translate(57.4 0)" fill="currentColor" />
          <circle cx={866.3} cy={116} r={16} className="fill-primary" />
        </g>
      </svg>
      <span className="sr-only">{brand.name}, go to the home page</span>
    </Link>
  );
}

export { Wordmark };
