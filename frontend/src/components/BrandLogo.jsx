import logo from '../assets/interview_prep_ai.png';

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const BrandLogo = ({ size = 'md', className = '' }) => (
  <img
    src={logo}
    alt="Interview Prep AI"
    className={`${SIZES[size] || SIZES.md} object-contain shrink-0 ${className}`}
  />
);

export default BrandLogo;
