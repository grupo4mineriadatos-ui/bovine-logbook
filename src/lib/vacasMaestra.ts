export type VacaMaestra = {
  caravana: string;
  categoria: string;
  fecha_nacimiento?: string;
  estado?: string;
  rodeo?: string;
};

export const VACAS_MAESTRA: VacaMaestra[] = [
  { caravana: "AR-001", categoria: "vaca", fecha_nacimiento: "2021-03-10", estado: "activa", rodeo: "rodeo_1" },
  { caravana: "AR-002", categoria: "vaca", fecha_nacimiento: "2020-07-22", estado: "activa", rodeo: "rodeo_1" },
  { caravana: "AR-003", categoria: "vaquillona", fecha_nacimiento: "2023-01-15", estado: "activa", rodeo: "rodeo_1" },
  { caravana: "AR-004", categoria: "vaca", fecha_nacimiento: "2019-11-20", estado: "activa", rodeo: "rodeo_2" },
  { caravana: "AR-005", categoria: "vaca", fecha_nacimiento: "2022-04-30", estado: "activa", rodeo: "rodeo_2" },
  { caravana: "AR-006", categoria: "vaquillona", fecha_nacimiento: "2023-06-18", estado: "activa", rodeo: "rodeo_2" },
  { caravana: "AR-007", categoria: "vaca", fecha_nacimiento: "2020-02-09", estado: "activa", rodeo: "rodeo_1" },
  { caravana: "AR-008", categoria: "vaca", fecha_nacimiento: "2021-09-27", estado: "activa", rodeo: "rodeo_1" },
];
