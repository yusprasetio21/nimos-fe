export class ObservationPolarizationFrequencies{
    id:number|string;
    instrument_id:number|string;
    use_of_frequency:number;
    frequency:string;
    frequency_unit_id:number;
    bandwidth:string;
    bandwidth_unit_id:number;
    transmission_mode_id?:number;
    polarization_id?:number;

    frequency_type_desc?:string;
    bandwidth_unit_desc?:string;
    frequency_unit_desc?:string;
}