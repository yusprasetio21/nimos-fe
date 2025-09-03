export class InstrumentOperatingStatus{
    id:number|string;
    instrument_id:number|string;//instrument caracteristic
    instrument_operating_status_id:number;
    from:Date|string|null;
    to:Date|string|null;

    operating_status_desc?:string;
}