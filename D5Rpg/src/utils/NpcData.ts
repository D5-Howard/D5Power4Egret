/**
 * Created by Administrator on 2015/6/2.
 */
module d5power {

    export class NpcData {
        public id:number; //npc Id
        public isDB:number = 0;
        public name:string;//npc 名
        public skin:string;//npc 皮肤
        public head:string;//npc 头像
        public inmap:number;//所在地图

        public constructor(){
        }
        public format(xml:any):void{
            this.id = parseInt(xml.id);
            if(xml.isDB)
            {
                this.isDB = parseInt(xml.isDB);
            }
            this.name = <string><any>(xml.name);
            this.skin = <string><any>(xml.skin);
            this.head = <string><any>(xml.head);
            this.inmap = parseInt(xml.inmap);
        }

        public toString():string{
            return "npc["+this.id+"]"+this.name+"[皮肤]"+this.skin+"[所在地图]"+this.inmap;
        }
    }
}
