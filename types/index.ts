export interface HealthData {
  id: number;
  title: string;
  icon: string;
  value?: string;
  unit?: string;
  highPressure?: string;
  lowPressure?: string;
  target?: string;
  note?: string;
  imageValue?: string;
  width: string;
  height: number;
}

export interface HealthCardProps {
  data: HealthData & { width: 'full' | 'half' };
  width: 'full' | 'half';
}


export interface UltrafiltrationData {
  concentration: string;
  infusionVolume: number;
  drainageVolume: number;
  ultrafiltrationVolume: number;
}