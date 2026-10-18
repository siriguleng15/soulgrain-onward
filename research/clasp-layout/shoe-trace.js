/* SoulGrain ONWARD — manual vector trace of the supplied side-view sketch.
 * Coordinate units are source-image pixels, NOT millimetres or a factory pattern.
 * The 1280 × 894 source is cropped only to remove application chrome.
 * No silhouette comes from a generic sneaker template or the V7 model.
 */
(() => {
  'use strict';

  const paths = {
    soleUpper: 'M 223 666 C 280 663 312 653 352 649 M 425 640 C 495 628 570 623 637 618 C 693 614 745 618 797 620 C 880 619 973 607 1043 576 C 1086 561 1104 543 1115 511',
    soleLower: 'M 225 673 C 238 692 246 719 257 735 C 286 751 327 749 366 748 C 445 731 519 712 608 700 C 684 692 748 704 834 714 C 927 706 1027 680 1090 644 L 1138 607 C 1132 595 1132 584 1137 564 C 1144 541 1129 522 1115 511',
    foxingStripe: 'M 239 698 C 290 724 350 709 407 703 C 478 694 540 676 607 674 C 680 670 732 678 795 680 C 842 681 879 678 909 674',
    heelSeam: 'M 203 551 C 207 594 211 633 223 666',
    foxingFrontSeam: 'M 902 623 C 912 642 912 673 916 701',
    toeCap: 'M 958 472 C 1007 468 1077 466 1103 493 C 1108 499 1112 504 1115 511 M 958 472 C 999 494 1030 526 1043 576',
    body: 'M 600 270 C 630 282 646 317 671 342 C 704 377 737 398 781 416 C 839 440 895 449 945 467 C 995 484 1027 520 1043 576 C 971 607 881 619 797 620 C 746 618 696 614 637 618 C 569 623 496 628 425 640 L 418 650 L 382 667 L 322 619 L 203 551 C 208 593 211 633 223 666',
    bodyPanelSeam: 'M 551 351 C 585 397 614 440 659 466 C 701 491 743 499 792 508 L 889 531 C 924 541 946 563 960 591',
    tongue: 'M 557 253 C 577 239 593 219 610 213 C 629 211 650 222 666 230 C 689 235 708 237 725 243 C 789 272 858 304 925 330 L 927 334 C 899 347 865 352 837 360 L 762 343 C 736 327 704 318 682 303 C 674 292 664 294 651 289 L 600 270 Z',
    tongueFold: 'M 557 253 C 588 236 620 228 666 230',
    cuffOuter: 'M 186 218 C 174 219 163 245 158 269 L 148 344 L 115 432 C 100 453 90 480 83 505 L 203 551 C 245 572 286 594 322 619 L 369 657 C 382 670 399 664 418 650 C 444 599 455 547 477 494 C 513 408 554 329 600 270 L 556 254 C 532 250 510 245 490 242 C 434 242 371 234 315 229 C 270 226 222 223 186 218 Z',
    cuffBoundary: 'M 83 505 L 203 551 C 245 572 286 594 322 619 L 369 657 C 382 670 399 664 418 650',
    cuffSplitUpper: 'M 148 344 C 224 358 320 409 398 459',
    cuffSplitLower: 'M 115 432 C 184 444 268 507 346 555',
    cuffEyeletRear: 'M 490 242 C 461 302 432 374 398 459 C 380 503 362 547 346 555 L 322 619',
    cuffEyeletFront: 'M 600 270 C 567 329 530 396 505 461 C 470 545 442 611 418 650',
    cuffInnerFold: 'M 585 286 C 556 345 535 404 512 460 C 481 532 455 594 433 635',
  };

  const keypoints = [
    { id: 'H', label: '翻筒后上角', x: 186, y: 218 },
    { id: 'E0', label: '鞋眼片后缘上端', x: 490, y: 242 },
    { id: 'F', label: '翻筒前上角', x: 600, y: 270 },
    { id: 'S0', label: '上分割缝后端', x: 148, y: 344 },
    { id: 'S1', label: '上分割缝与眼片交点', x: 398, y: 459 },
    { id: 'T0', label: '下分割缝后端', x: 115, y: 432 },
    { id: 'T1', label: '下分割缝与眼片交点', x: 346, y: 555 },
    { id: 'R', label: '翻筒后下角', x: 83, y: 505 },
    { id: 'B0', label: '翻筒下缘与后跟连接', x: 203, y: 551 },
    { id: 'B1', label: '翻筒下缘转折', x: 322, y: 619 },
    { id: 'B2', label: '翻筒垂落最低点', x: 382, y: 667 },
    { id: 'B3', label: '翻筒前下角', x: 418, y: 650 },
    { id: 'L', label: '后跟鞋底上缘', x: 223, y: 666 },
    { id: 'N', label: '鞋头包边起点', x: 958, y: 472 },
    { id: 'P', label: '鞋头包边下缘', x: 1043, y: 576 },
    { id: 'Q', label: '鞋头前端', x: 1138, y: 607 },
  ];

  const eyelets = [
    { x: 510, y: 284, rx: 16, ry: 14, angle: -25, part: 'cuff' },
    { x: 475, y: 368, rx: 17, ry: 15, angle: -34, part: 'cuff' },
    { x: 442, y: 440, rx: 15, ry: 18, angle: -7, part: 'cuff' },
    { x: 410, y: 513, rx: 13, ry: 15, angle: -18, part: 'cuff' },
    { x: 381, y: 583, rx: 13, ry: 14, angle: -15, part: 'cuff' },
    { x: 583, y: 338, rx: 12, ry: 17, angle: 14, part: 'body' },
    { x: 626, y: 395, rx: 12, ry: 15, angle: -17, part: 'body' },
    { x: 678, y: 435, rx: 15, ry: 15, angle: 14, part: 'body' },
    { x: 741, y: 457, rx: 13, ry: 15, angle: -9, part: 'body' },
    { x: 802, y: 478, rx: 13, ry: 15, angle: 14, part: 'body' },
    { x: 865, y: 487, rx: 13, ry: 15, angle: -12, part: 'body' },
    { x: 928, y: 500, rx: 12, ry: 15, angle: 3, part: 'body' },
  ];

  const path = (key, extra = '') => `<path data-structure="${key}" d="${paths[key]}" ${extra}/>`;
  const markup = `
    <g id="shoe-original" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
      <g class="shoe-outline" fill="#fff" stroke="#26303b" stroke-width="2.2">
        ${path('body')}
        ${path('tongue')}
        ${path('cuffOuter')}
      </g>
      <g class="shoe-base-lines" fill="none" stroke="#26303b" stroke-width="2.2">
        ${['soleUpper', 'soleLower', 'foxingStripe', 'toeCap', 'foxingFrontSeam', 'tongueFold'].map(k => path(k)).join('')}
      </g>
      <g class="structure-seams" fill="none" stroke="#287d87" stroke-width="2.2">
        ${['cuffSplitUpper', 'cuffSplitLower', 'cuffBoundary', 'cuffEyeletRear', 'cuffEyeletFront', 'bodyPanelSeam', 'heelSeam'].map(k => path(k)).join('')}
      </g>
      <g class="fold-return" fill="none" stroke="#687b86" stroke-width="1.3">
        ${path('cuffInnerFold')}
      </g>
      <g class="shoe-eyelets" fill="#fff" stroke="#26303b" stroke-width="2.2">
        ${eyelets.map(e => `<ellipse data-part="${e.part}" cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.angle} ${e.x} ${e.y})"/>`).join('')}
      </g>
    </g>`;

  globalThis.ShoeTrace = Object.freeze({
    viewBox: '60 185 1110 590',
    markup,
    keypoints,
    paths,
    eyelets,
    source: {
      width: 1280,
      height: 894,
      coordinates: 'source-image pixels; x rightwards, y downwards',
      method: 'Manual vector tracing of the user-supplied side-view drawing; curves retain sketch asymmetry.',
      caution: '2D design reference only. Perspective and hand-drawn error remain. Not production dimensions.',
    },
  });
})();
