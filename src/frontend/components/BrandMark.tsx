import Image from 'next/image';

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export default function BrandMark({ size = 44, className = '' }: BrandMarkProps) {
  return (
    <Image
      src="/assets/images/oloolua-youth-guardians-round.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      className={`block shrink-0 rounded-full ${className}`}
    />
  );
}
