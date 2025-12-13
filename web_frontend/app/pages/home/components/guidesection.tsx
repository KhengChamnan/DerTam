// import { Lightbulb } from 'lucide-react';

// interface GuideSectionProps {
//   tips: string[];
// }

// export default function GuideSection({ tips }: GuideSectionProps) {
//   return (
//     <div className="bg-blue-50 rounded-lg shadow-sm p-6">
//       <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
//         <Lightbulb className="w-5 h-5 mr-2" style={{ color: '#01005B' }} />
//         Visitor Tips
//       </h3>
//       <ul className="space-y-3">
//         {tips.map((tip, index) => (
//           <li key={index} className="flex items-start">
//             <span className="text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0" style={{ backgroundColor: '#01005B' }}>
//               {index + 1}
//             </span>
//             <span className="text-gray-700">{tip}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }