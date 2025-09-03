import { DataGeneration } from "./data_generation";
import { DataUrls } from "./data_urls";
import { DeploymentAplicationArea } from "./deployment_aplication_area";
import { Instrument } from "./instrument_characteristic";

export class Deployment{
    id: number|string|null|any;
    from:Date;
    to:Date|null;
    observation_id:number|string;//rever to observation
    source_of_observation_id:number;//Refer to table source_observations
    distance_from_reference_surface?:number;
    reference_surface_type_id?:number;// Refer to table reference_surface_type
    application_areas?:DeploymentAplicationArea[];
    exposure_id?:number;//Refer to table exposures
    configuration:string;
    representativeness_id:number;//Refer to tabel representativenesses
    measurement_leader?:number;
    organization_id?:number;
    is_near_real_time?:number;
    near_real_time_url?:string;
    data_centre_id?:number;// Refer to table data_center
    data_communication_method_id?:number;// Refer to table data_communication_method
    qaqc_schedule?:string;
    maintenance_schedule?:string;
    is_certified_observation:number;
    comments?:string;
    photos:string[];

    id_station?:number;

    //Tambahan
    source_obs_desc?:string;
    representativeness_of_obs_desc?: string;
    reference_surface_type_desc?:string;
    exposure_desc?:string;
    measurement_leader_desc?:string;
    organization_desc?:string;
    data_centre_desc?:string;
    data_communicatino_method_desc?:string;

    //Relasi
    data_urls?:DataUrls[];

    //INTRUMENT CHARACTERISTIC
    instrument?:Instrument;

    //DATA GENERATION
    data_generation?:DataGeneration[];
}