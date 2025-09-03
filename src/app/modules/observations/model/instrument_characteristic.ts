import { Coordinates } from "./coordinates";
import { InstrumentOperatingStatus } from "./instrument_operating_status";
import { MaintenanceLogBooks } from "./maintenance_logbooks";
import { ObservationPolarizationFrequencies } from "./observation_polarization_frequencies";
import { QualityAssuranceLogBooks } from "./quality_assurance_logbooks";
import { TelecomunicationFrequencies } from "./telecommunication_frequencies";

//nama tabelnya instrument
export class Instrument{
    id:string|number;
    deployment_id:number;
    instrument_assigned_type_id?:number;
    manufacturer_id?:number;
    instrument_model_id?:number;
    serial_number?:string;
    observing_method_id:number;
    method_details?:string;
    method_comments?:string;
    firmware_version?:string;
    instrument_specifications?:{
        observable_range?:string;
        relative_uncertainty?:string;
        absolute_uncertainty?:string;
        drift_per_unit_time?:string;
        specification_url?:string;
        uncertainty_evaluation_procedure?:number;
    };
    comments?:string;

    //relasi
    coordinates:Coordinates[];
    operating_statuses?:InstrumentOperatingStatus[];
    observation_frequency_and_polarization?:ObservationPolarizationFrequencies[];
    telecommunication_frequencies?:TelecomunicationFrequencies[];
    maintenance_logbooks?:MaintenanceLogBooks[];
    quality_assurance_logbooks?:QualityAssuranceLogBooks[];

    //tambahan
    manufacturer_desc?:string;
    instrument_model_desc?: string;
    observing_method_desc?:string;
    instrument_assigned_type_desc?:string;
    uncertainty_evaluation_procedure_desc?:string;
}