export class OperatingStatus{
    id:number;
    instrument_id:string|number;
    instrument_operating_status_id:number;
    from:Date|string|null;
    to:Date|string|null;

    operating_status_desc?:string;
}