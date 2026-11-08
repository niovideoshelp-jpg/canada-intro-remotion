import React from 'react';

/** Pictograma de pessoa (caixa 40x100). */
export const PERSON_HEAD = {cx: 20, cy: 11, r: 10};
export const PERSON_BODY =
  'M6,27 Q6,22 11,22 H29 Q34,22 34,27 V58 Q34,61.5 30.5,61.5 H29 V95 Q29,99 25.5,99 H23.5 Q21,99 21,95 V65 H19 V95 Q19,99 16.5,99 H14.5 Q11,99 11,95 V61.5 H9.5 Q6,61.5 6,58 Z';
/** Contorno continuo (cabeca + corpo) para desenhar com DrawSVG. */
export const PERSON_OUTLINE = `M20,1 A10,10 0 1,1 19.99,1 Z ${PERSON_BODY}`;

export const Person: React.FC<{
  x: number;
  y: number;
  h: number;
  fill?: string;
  stroke?: string;
  strokeW?: number;
  dashed?: boolean;
  className?: string;
  clipW?: number;
}> = ({x, y, h, fill = 'none', stroke = 'none', strokeW = 0, dashed, className, clipW}) => {
  const k = h / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} className={className}>
      {clipW !== undefined ? (
        <clipPath id={`pclip-${Math.round(x)}-${Math.round(y)}`}>
          <rect x={0} y={0} width={40 * clipW} height={100} />
        </clipPath>
      ) : null}
      <g clipPath={clipW !== undefined ? `url(#pclip-${Math.round(x)}-${Math.round(y)})` : undefined}>
        <circle cx={PERSON_HEAD.cx} cy={PERSON_HEAD.cy} r={PERSON_HEAD.r} fill={fill} stroke={stroke} strokeWidth={strokeW / k} strokeDasharray={dashed ? `${5} ${4}` : undefined} />
        <path d={PERSON_BODY} fill={fill} stroke={stroke} strokeWidth={strokeW / k} strokeLinejoin="round" strokeDasharray={dashed ? `${5} ${4}` : undefined} />
      </g>
    </g>
  );
};
