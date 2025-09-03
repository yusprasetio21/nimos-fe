export class Icon {
    id: number;
    name: string;
    class: string;
    style: string;
    type: string;

    set icon(icon: unknown) {
        const item = icon as Icon;
        this.id = item.id;
        this.name = item.name;
        this.class = item.class;
        this.style = item.style;
        this.type = item.type;
    }
}
