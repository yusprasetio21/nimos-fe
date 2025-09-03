export class Coordinates{
    id:number|string;
    instrument_id:number|string;
    latitude:string;
    longitude:string;
    station_elevation:string;
    geopositioning_method_id:number;
    from:Date|string|null;

    geopositioning_name?:string;
}