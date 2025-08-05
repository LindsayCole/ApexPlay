
import React from 'react';
import Svg, { Path, Circle, Line, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  color?: string;
  size?: number;
}

const iconFactory = (paths: (color: string) => React.ReactNode) => 
  React.memo<IconProps>(({ color = 'currentColor', size = 24, ...props }) => (
    <Svg height={size} width={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} {...props}>
      {paths(color)}
    </Svg>
));

export const PlayIcon = iconFactory((color) => <Path d="M8 5v14l11-7z" stroke="none" fill={color}/>);
export const StopIcon = iconFactory((color) => <Path d="M6 6h12v12H6z" stroke="none" fill={color} />);

export const SettingsIcon = iconFactory(() => <>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</>);

export const BroadcastIcon = iconFactory(() => <>
    <Circle cx="12" cy="12" r="2" fill="none"/>
    <Path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
</>);

export const HockeyPuckIcon = iconFactory((color) => <>
    <Path d="M22,12A10,10,0,0,0,12,2V4A8,8,0,0,1,20,12A8,8,0,0,1,12,20V22A10,10,0,0,0,22,12Z" stroke="none" fill={color}/>
    <Path d="M12,2A10,10,0,0,0,2,12A10,10,0,0,0,12,22V20A8,8,0,0,1,4,12A8,8,0,0,1,12,4Z" stroke="none" fill={color}/>
</>);

export const MicrophoneIcon = iconFactory(() => <>
    <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></Path>
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2"></Path>
    <Line x1="12" y1="19" x2="12" y2="23"></Line>
    <Line x1="8" y1="23" x2="16" y2="23"></Line>
</>);

export const MicrophoneOffIcon = iconFactory(() => <>
    <Line x1="1" y1="1" x2="23" y2="23"></Line>
    <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></Path>
    <Path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></Path>
    <Line x1="12" y1="19" x2="12" y2="23"></Line>
    <Line x1="8" y1="23" x2="16" y2="23"></Line>
</>);

export const CameraFlipIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M16 3.54a2.5 2.5 0 0 1 3 4.96h-1a1.5 1.5 0 0 0-2.37-2.96L16 3.54zm-8 16.92a2.5 2.5 0 0 1-3-4.96h1a1.5 1.5 0 0 0 2.37 2.96l-.37 2zM12 4L8 8m4-4l4 4m-4 8l-4 4m4-4l4 4"/>)

export const CameraIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />);

export const AlertTriangleIcon = iconFactory((color) => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.01c-.77 1.333.192 3 1.732 3z" />);

export const XIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />);

export const PlusIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />);
export const MinusIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />);
export const ChevronUpIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />);
export const ChevronDownIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />);

export const ReplayIcon = iconFactory((color) => <Path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" stroke="none" fill={color}/>);
export const TrashIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />);
export const UploadIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />);

export const CheckIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />);
export const SaveIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />);
export const PencilIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />);
export const EyeIcon = iconFactory(() => <>
  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</>);
export const EyeOffIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />);

export const SparklesIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-1V6M21 8h-4m-1 8v4m2-2h-4M12 21a9 9 0 110-18 9 9 0 010 18z" />)
export const BookmarkSquareIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0016.5 3.75z" />);
export const ShareIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />);
export const CalendarPlusIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />);
export const InformationCircleIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />);
export const ChartBarIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />);

export const BatteryIcon = iconFactory(() => <>
    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H21" />
    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5.625c0-1.036-.84-1.875-1.875-1.875H5.625C4.59 3.75 3.75 4.59 3.75 5.625v12.75c0 1.035.84 1.875 1.875 1.875h7.5c1.035 0 1.875-.84 1.875-1.875V5.625z" />
</>);
export const BoltIcon = iconFactory((color) => <Path d="M11.983 1.904a1.25 1.25 0 00-2.233-.94l-7.5 10.5a1.25 1.25 0 00.94 2.233h3.538l-2.09 5.85a1.25 1.25 0 002.233.94l7.5-10.5a1.25 1.25 0 00-.94-2.233H9.462l2.09-5.85z" stroke="none" fill={color}/>);
export const FolderIcon = iconFactory(() => <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 01-2.25-2.25V6.75c0-1.242.988-2.25 2.25-2.25h3.75c.621 0 1.125.504 1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125h5.25c.621 0 1.125-.504 1.125-1.125V6.75c0-.621.504-1.125 1.125-1.125h3.75c1.262 0 2.25.988 2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25M3.75 9.75v6.75a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 16.5V9.75" />);
