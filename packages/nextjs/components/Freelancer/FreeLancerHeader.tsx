import { TotalNumFreelancer } from "./TotalNumFreelancer";
import { Input } from "~~/components/ui/input";

export const FreeLancerHeader = () => {
    return (
        <div className="justify">
            <Input className="border-2 border-black" />
            <TotalNumFreelancer />
        </div>
    );
};
