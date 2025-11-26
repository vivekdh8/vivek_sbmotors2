export interface CarData {
    id: string;
    name: string;
    year: number | string;
    price: string;
    km: string;
    fuel: string;
    transmission: string;
    owner: string;
    type: string;
    image: string;
    description: string;
    features: string[];
    status: string;
}

export interface UserData {
    name: string;
    phone: string;
}
