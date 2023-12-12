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
    }

    switchTo(newMenu){
        if (newMenu == "main"){
            this.activeMenu = this.mainMenu;
        }else if (newMenu == "dogfight"){
            this.activeMenu = this.dogfightMenu;
        }else if (newMenu == "pauseMenu"){
            this.activeMenu = this.pauseMenu;
        }else{
            this.activeMenu = null;
        }
    }


}