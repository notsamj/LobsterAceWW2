class MenuManager {
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.mainMenu = new MainMenu();
        this.pauseMenu = new PauseMenu();
        this.dogfightMenu = new DogfightMenu();
        this.activeMenu = this.mainMenu;
    }

    hasActiveMenu(){
        return this.activeMenu != null;
    }

    display(){
        if (!this.hasActiveMenu()){ return; }
        this.activeMenu.display();
    }

    click(screenX, screenY){
        if (!this.hasActiveMenu()){ return; }
        this.activeMenu.click(screenX, this.changeFromScreenY(screenY));
    }

    changeFromScreenY(y){
        return this.height - y;
    }

    changeToScreenY(y){ return this.changeFromScreenY(y); }

    static setupClickListener(){
        document.getElementById("defaultCanvas0").addEventListener("click", (event) => {
            menuManager.click(event.clientX, event.clientY);
        });

        document.onkeydown = (event) => {
            if (event.key === "Escape"){
                menuManager.escapeKey();
            }
        };
    }

    lostFocus(){
        if (!this.hasActiveMenu()){
            this.switchTo("pauseMenu");
        }
    }

    escapeKey(){
        if (this.activeMenu == this.pauseMenu){
            this.switchTo("game");
        }else if (!this.hasActiveMenu()){
            this.switchTo("pauseMenu");
        }
    }

    switchTo(newMenu){
        if (newMenu == "main"){
            this.activeMenu = this.mainMenu;
        }else if (newMenu == "dogfight"){
            this.activeMenu = this.dogfightMenu;
        }else if (newMenu == "pauseMenu"){
            scene.disableTicks();
            this.activeMenu = this.pauseMenu;
        }else if (newMenu == "game"){
            scene.enable();
            this.activeMenu = null;
        }else{
            this.activeMenu = null;
        }
    }


}