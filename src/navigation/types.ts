export type StudentTabParamList = {
  Home: undefined;
  Academics: undefined;
  VMaps: undefined;
  Services: undefined;
  Mess: undefined;
};

export type StudentStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

export type WardenTabParamList = {
  Incoming: undefined;
  VMaps: undefined;
};

export type WardenStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ServicesStackParamList = {
  ServicesList: undefined;
  ServiceNew: undefined;
  ServiceDetail: { id: string };
};

export type RootStackParamList = {
  Login: undefined;
  Student: undefined;
  Warden: undefined;
};
